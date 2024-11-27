"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useSuperset } from "@/hooks/use-superset"
import { Efr_Users } from "@/types/tables"
import { SuperSetExecuteResponse } from "@/types/superset"

export default function UserList() {
    const [inputData, setInputData] = useState("")
    const [users, setUsers] = useState<Efr_Users[] | undefined>()
    const { data, isLoading, execute } = useSuperset<SuperSetExecuteResponse<Efr_Users>>();

    useEffect(() => {
        execute("")
    }, [execute])

    useEffect(() => {
        setUsers(data?.data)
    }, [data?.data])

    useEffect(() => {
        const filteredUsers = data?.data?.filter((item) => item.UserName?.includes(inputData)) 
        setUsers(filteredUsers);
    }, [inputData, data?.data])

    return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Listesi</CardTitle>
          <CardDescription>Sistemde kayıtlı tüm kullanıcıların listesi</CardDescription>
          
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              placeholder="Kullanıcı ara..."
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Yükleniyor...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users?.map((user) => (
                  <TableRow key={user.UserID}>
                    <TableCell>{user.UserID}</TableCell>
                    <TableCell>{user.UserName}</TableCell>
                    <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Düzenle</Button>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
