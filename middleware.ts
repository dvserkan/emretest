import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Superset } from './pages/api/superset';
import { CACHE_CONSTANTS } from './pages/api/constants';
import { Efr_Users } from './types/tables';
import { jwtVerify, SignJWT, decodeJwt } from 'jose';

export const config = {
    matcher: [
        // Normal sayfalar için (static dosyalar hariç)
        '/((?!api|_next/static|_next/image|images|favicon.ico).*)',

        // API rotaları için spesifik tanımlar
        '/api/((?!auth).)*' // auth dışındaki tüm API rotaları
    ]
}


async function checkTenantDatabase(tenantId: string): Promise<boolean> {

    try {
        const superset = Superset.getInstance();
        const databases = await superset.getDatabases();

        if ('error' in databases) {
            console.error('Database fetch error:', databases.error);
            throw new Error(databases.message);
        }

        return databases.result.some(db => db.database_name.toLowerCase() === tenantId.toLowerCase());
    } catch (error) {
        console.error('Tenant database check error:', error);
        return false;
    }
}

export async function middleware(request: NextRequest) {
    var tenantId = request.nextUrl.pathname.split('/')[1];

    if(request.nextUrl.pathname.includes("/api/")){
        const referrer = request.headers.get('referer') || '';
        const referrerParts = referrer.split('/');
        tenantId = referrerParts[3];
    }

    const ACCESS_TOKEN_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
    const REFRESH_TOKEN_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);
    const NEXT_PUBLIC_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost';
    const NODE_ENV = process.env.NODE_ENV || 'development';
    const ACCESS_TOKEN_LIFETIME = parseInt(process.env.ACCESS_TOKEN_LIFETIME || '900');
    const REFRESH_TOKEN_LIFETIME = parseInt(process.env.REFRESH_TOKEN_LIFETIME || '129600');
    const ACCESS_TOKEN_ALGORITHM = process.env.ACCESS_TOKEN_ALGORITHM || 'HS512';
    const REFRESH_TOKEN_ALGORITHM = process.env.REFRESH_TOKEN_ALGORITHM || 'HS512';

    if (request.nextUrl.pathname.includes("notfound")) {
        if (tenantId || tenantId !== '' && !request.nextUrl.pathname.includes("/api/")) {
            const databaseExists = await checkTenantDatabase(tenantId);

            if (databaseExists) {
                return NextResponse.redirect(new URL(`/${tenantId}/login`, request.url));
            }
        }
        return NextResponse.next();
    }
    if (!tenantId || tenantId === '' && !request.nextUrl.pathname.includes("/api/")) {
        return NextResponse.redirect(new URL(`/notfound`, request.url));
    }

    try {
        if (!tenantId.includes("api")) {
            const databaseExists = await checkTenantDatabase(tenantId);

            if (!databaseExists) {
                return NextResponse.redirect(new URL(`/${tenantId}/notfound`, request.url));
            }
        }


        const accessToken = request.cookies.get("access_token")
        const refreshToken = request.cookies.get("refresh_token")

        if (!accessToken || !refreshToken || accessToken?.value === '' || refreshToken?.value === '') {
            if (request.nextUrl.pathname.includes("login") || tenantId.includes("api")) {
                return NextResponse.next();
            }
            const response = NextResponse.redirect(new URL(`/${tenantId}/login`, request.url));
            response.cookies.set('access_token', '', { maxAge: 0 });
            response.cookies.set('refresh_token', '', { maxAge: 0 });
            return response;
        }

        // Token doğrulama
        let isVerifiedAccessToken = false;
        let isVerifiedRefreshToken = false;

        try {
            await jwtVerify(
                accessToken.value,
                ACCESS_TOKEN_SECRET,
                {
                    audience: tenantId,
                    issuer: NEXT_PUBLIC_DOMAIN,
                    algorithms: [ACCESS_TOKEN_ALGORITHM],
                    requiredClaims: ['username', 'userId', 'userBranches']
                }
            );
            isVerifiedAccessToken = true;
        } catch (error) {
            isVerifiedAccessToken = false;
        }

        try {
            await jwtVerify(
                refreshToken.value,
                REFRESH_TOKEN_SECRET,
                {
                    audience: tenantId,
                    issuer: NEXT_PUBLIC_DOMAIN,
                    maxTokenAge: REFRESH_TOKEN_LIFETIME,
                    algorithms: [REFRESH_TOKEN_ALGORITHM]
                }
            );
            isVerifiedRefreshToken = true;
        } catch (error) {
            isVerifiedRefreshToken = false;
        }


        if (isVerifiedRefreshToken && isVerifiedAccessToken) {
            try {
                await jwtVerify(
                    accessToken.value,
                    ACCESS_TOKEN_SECRET,
                    {
                        audience: tenantId,
                        issuer: NEXT_PUBLIC_DOMAIN,
                        algorithms: [ACCESS_TOKEN_ALGORITHM],
                        maxTokenAge: ACCESS_TOKEN_LIFETIME,
                        requiredClaims: ['username', 'userId', 'userBranches']
                    }
                );
                isVerifiedAccessToken = true;
            } catch (error) {
                isVerifiedAccessToken = false;
            }
            const decodedAccessToken = decodeJwt(accessToken.value);


            if (!decodedAccessToken) {
                return NextResponse.redirect(new URL(`/${tenantId}/login`, request.url));
            }

            const user = decodedAccessToken as Efr_Users;

            if (!isVerifiedAccessToken) {
                const tokenPayload = {
                    username: user.UserName,
                    userId: user.UserID,
                    userBranches: user.UserBranchs
                }

                const newAccessToken = await new SignJWT(tokenPayload)
                    .setProtectedHeader({ alg: ACCESS_TOKEN_ALGORITHM })
                    .setExpirationTime(Math.floor(Date.now() / 1000) + ACCESS_TOKEN_LIFETIME)
                    .setIssuer(NEXT_PUBLIC_DOMAIN)
                    .setAudience(tenantId)
                    .setIssuedAt(Math.floor(Date.now() / 1000))
                    .sign(ACCESS_TOKEN_SECRET);

                const response = NextResponse.next();

                response.cookies.set('access_token', newAccessToken, {
                    httpOnly: true,
                    secure: NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: ACCESS_TOKEN_LIFETIME,
                    path: '/',
                    domain: NEXT_PUBLIC_DOMAIN
                });

                return response;
            }

            if (request.nextUrl.pathname.includes("login")) {
                return NextResponse.redirect(new URL(`/${tenantId}`, request.url));
            }
            return NextResponse.next();
        }


        if (request.nextUrl.pathname.includes("login")) {
            return NextResponse.next();
        }

        const response = NextResponse.redirect(new URL(`/${tenantId}/login`, request.url));
        response.cookies.set('access_token', '', { maxAge: 0 });
        response.cookies.set('refresh_token', '', { maxAge: 0 });
        return response;

    } catch (error) {
        console.error('Middleware error:', error);
        return NextResponse.redirect(new URL(`/${tenantId}/notfound`, request.url));
    }
}

const cleanupCache = async () => {
    const superset = Superset.getInstance();
    await superset.getDatabases();
}

setInterval(cleanupCache, CACHE_CONSTANTS.DATABASE.TTL);