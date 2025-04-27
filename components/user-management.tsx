"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Loader2, PlusCircle, Trash2, UserCog } from "lucide-react"
import {
  type User,
  type UserRole,
  type CreateUserPayload,
  USER_ROLE_DISPLAY_NAMES,
  USER_ROLE_BADGE_VARIANTS,
} from "@/types/models/user"

// ユーザー作成フォームのバリデーションスキーマを修正
const userFormSchema = z.object({
  email: z.string().email({ message: "有効なメールアドレスを入力してください" }),
  userId: z
    .string()
    .min(3, { message: "ユーザーIDは3文字以上である必要があります" })
    .regex(/^[a-zA-Z0-9_-]+$/, { message: "ユーザーIDは英数字、アンダースコア、ハイフンのみ使用できます" }),
  fullName: z.string().min(2, { message: "名前は2文字以上である必要があります" }),
  role: z.enum(["admin", "manager", "staff", "user"] as const, { required_error: "ロールを選択してください" }),
  department: z.string().optional(),
  position: z.string().optional(),
})

type UserFormValues = Omit<CreateUserPayload, "role"> & { role: UserRole }

export function UserManagement({ initialUsers }: { initialUsers: User[] }) {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdatingRole, setIsUpdatingRole] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null)

  // フォーム初期化
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      userId: "",
      fullName: "",
      role: "user",
      department: "",
      position: "",
    },
  })

  // ユーザー作成処理（認証なしバージョン）
  async function onSubmit(values: UserFormValues) {
    setIsCreating(true)
    try {
      // 新しいユーザーオブジェクトを作成
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: values.email,
        full_name: values.fullName,
        position: values.position || null,
        department: values.department || null,
        created_at: new Date().toISOString(),
        roles: [values.role],
        user_id: values.userId,
      }

      // ユーザーリストに追加
      setUsers([newUser, ...users])

      toast({
        title: "ユーザーを作成しました",
        description: "新しいユーザーが正常に作成されました",
      })

      form.reset()
      setOpenDialog(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "不明なエラーが発生しました",
      })
    } finally {
      setIsCreating(false)
    }
  }

  // ユーザー削除処理（認証なしバージョン）
  async function handleDeleteUser() {
    if (!selectedUserId) return

    setIsDeleting(true)
    try {
      // ユーザーリストから削除
      setUsers(users.filter((user) => user.id !== selectedUserId))

      toast({
        title: "ユーザーを削除しました",
        description: "ユーザーが正常に削除されました",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "不明なエラーが発生しました",
      })
    } finally {
      setIsDeleting(false)
      setSelectedUserId(null)
    }
  }

  // ロール更新処理（認証なしバージョン）
  async function handleUpdateRole(role: string) {
    if (!selectedUserForRole) return

    setIsUpdatingRole(true)
    try {
      // ユーザーリストを更新
      setUsers(
        users.map((user) => {
          if (user.id === selectedUserForRole.id) {
            return { ...user, roles: [role] }
          }
          return user
        }),
      )

      toast({
        title: "ロールを更新しました",
        description: "ユーザーのロールが正常に更新されました",
      })

      setRoleDialogOpen(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : "不明なエラーが発生しました",
      })
    } finally {
      setIsUpdatingRole(false)
      setSelectedUserForRole(null)
    }
  }

  // ロールの色を取得
  function getRoleBadgeVariant(role: UserRole) {
    return USER_ROLE_BADGE_VARIANTS[role] as any
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">ユーザー管理</h2>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              新規ユーザー作成
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>新規ユーザー作成</DialogTitle>
              <DialogDescription>新しいユーザーを作成します。必要な情報を入力してください。</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>メールアドレス</FormLabel>
                      <FormControl>
                        <Input placeholder="user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ユーザーID</FormLabel>
                      <FormControl>
                        <Input placeholder="user123" {...field} />
                      </FormControl>
                      <FormDescription>ログインに使用するIDです。英数字3文字以上で設定してください</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>氏名</FormLabel>
                      <FormControl>
                        <Input placeholder="山田 太郎" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ロール</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="ロールを選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">管理者</SelectItem>
                          <SelectItem value="manager">マネージャー</SelectItem>
                          <SelectItem value="staff">スタッフ</SelectItem>
                          <SelectItem value="user">一般ユーザー</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>部署</FormLabel>
                      <FormControl>
                        <Input placeholder="営業部" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>役職</FormLabel>
                      <FormControl>
                        <Input placeholder="マネージャー" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    ユーザーを作成
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>氏名</TableHead>
              <TableHead>ユーザーID</TableHead>
              <TableHead>メールアドレス</TableHead>
              <TableHead>ロール</TableHead>
              <TableHead>部署</TableHead>
              <TableHead>役職</TableHead>
              <TableHead>作成日</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  ユーザーが見つかりません
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.user_id || "-"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge key={role} variant={getRoleBadgeVariant(role as UserRole) as any}>
                          {USER_ROLE_DISPLAY_NAMES[role as UserRole]}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{user.department || "-"}</TableCell>
                  <TableCell>{user.position || "-"}</TableCell>
                  <TableCell>
                    {user.created_at ? format(new Date(user.created_at), "yyyy年MM月dd日", { locale: ja }) : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedUserForRole(user)
                          setRoleDialogOpen(true)
                        }}
                      >
                        <UserCog className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => setSelectedUserId(user.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>ユーザーを削除しますか？</AlertDialogTitle>
                            <AlertDialogDescription>
                              この操作は元に戻せません。このユーザーに関連するすべてのデータが削除されます。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>キャンセル</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteUser}
                              disabled={isDeleting}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              削除
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ロール変更ダイアログ */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>ユーザーロールの変更</DialogTitle>
            <DialogDescription>{selectedUserForRole?.full_name}のロールを変更します。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">新しいロール</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className={selectedUserForRole?.roles.includes("admin") ? "border-primary" : ""}
                  onClick={() => handleUpdateRole("admin")}
                  disabled={isUpdatingRole}
                >
                  管理者
                </Button>
                <Button
                  variant="outline"
                  className={selectedUserForRole?.roles.includes("manager") ? "border-primary" : ""}
                  onClick={() => handleUpdateRole("manager")}
                  disabled={isUpdatingRole}
                >
                  マネージャー
                </Button>
                <Button
                  variant="outline"
                  className={selectedUserForRole?.roles.includes("staff") ? "border-primary" : ""}
                  onClick={() => handleUpdateRole("staff")}
                  disabled={isUpdatingRole}
                >
                  スタッフ
                </Button>
                <Button
                  variant="outline"
                  className={selectedUserForRole?.roles.includes("user") ? "border-primary" : ""}
                  onClick={() => handleUpdateRole("user")}
                  disabled={isUpdatingRole}
                >
                  一般ユーザー
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              キャンセル
            </Button>
            <Button disabled={isUpdatingRole}>
              {isUpdatingRole && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              変更を保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
