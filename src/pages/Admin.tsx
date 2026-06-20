import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth, api } from '@/context/AuthContext';

interface Stats { users: number; images: number; done: number; messages: number; by_provider: { provider: string; count: number }[]; by_day: { day: string; count: number }[]; }
interface AUser { id: number; email: string; name: string; role: string; credits: number; plan: string; is_blocked: boolean; images: number; }
interface AProv { id: number; slug: string; name: string; model: string; secret_name: string; is_active: boolean; credit_cost: number; }
interface AMsg { id: number; name: string; email: string; subject: string; message: string; status: string; created_at: string; }

const Admin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AUser[]>([]);
  const [providers, setProviders] = useState<AProv[]>([]);
  const [messages, setMessages] = useState<AMsg[]>([]);
  const [msgView, setMsgView] = useState<AMsg | null>(null);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    api.adminStats().then(setStats).catch(() => {});
    api.adminUsers().then((d) => setUsers(d.users || [])).catch(() => {});
    api.adminProviders().then((d) => setProviders(d.providers || [])).catch(() => {});
    api.adminMessages().then((d) => setMessages(d.messages || [])).catch(() => {});
  }, [user]);

  const updateUser = async (id: number, data: Partial<AUser>) => {
    try {
      await api.adminUpdateUser({ id, ...data } as { id: number });
      setUsers((arr) => arr.map((u) => u.id === id ? { ...u, ...data } : u));
      toast({ title: 'Пользователь обновлён' });
    } catch (e) { toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' }); }
  };

  const updateProvider = async (p: AProv, data: Partial<AProv>) => {
    const next = { ...p, ...data };
    try {
      await api.adminUpdateProvider({ id: p.id, is_active: next.is_active, credit_cost: next.credit_cost, model: next.model });
      setProviders((arr) => arr.map((x) => x.id === p.id ? next : x));
    } catch (e) { toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' }); }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="container py-20 text-center">
        <Icon name="ShieldAlert" size={48} className="mx-auto mb-4 text-destructive opacity-70" />
        <h2 className="font-display font-bold text-2xl mb-2">Доступ запрещён</h2>
        <p className="text-muted-foreground mb-6">Эта страница доступна только администраторам</p>
        <Link to="/"><Button variant="outline">На главную</Button></Link>
      </div>
    );
  }

  const maxDay = Math.max(...(stats?.by_day.map((d) => d.count) || [1]), 1);

  return (
    <div className="container py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center glow">
          <Icon name="Shield" size={22} className="text-white" />
        </div>
        <div>
          <h1 className="font-display font-extrabold text-3xl">Админпанель</h1>
          <p className="text-muted-foreground text-sm">Управление платформой NeuroArt</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { v: stats?.users ?? '—', l: 'Пользователей', icon: 'Users', c: 'text-primary' },
          { v: stats?.images ?? '—', l: 'Генераций', icon: 'Image', c: 'text-accent' },
          { v: stats?.done ?? '—', l: 'Успешных', icon: 'CircleCheck', c: 'text-green-400' },
          { v: stats?.messages ?? '—', l: 'Сообщений', icon: 'Mail', c: 'text-pink-400' },
        ].map((s) => (
          <Card key={s.l} className="glass border-white/10">
            <CardContent className="p-5">
              <Icon name={s.icon} size={20} className={`mb-3 ${s.c}`} />
              <div className="font-display font-black text-3xl">{s.v}</div>
              <div className="text-sm text-muted-foreground">{s.l}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="glass mb-6 flex-wrap h-auto">
          <TabsTrigger value="dashboard" className="data-[state=active]:gradient-bg data-[state=active]:text-white gap-1.5"><Icon name="LayoutDashboard" size={15} /> Дашборд</TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:gradient-bg data-[state=active]:text-white gap-1.5"><Icon name="Users" size={15} /> Пользователи</TabsTrigger>
          <TabsTrigger value="providers" className="data-[state=active]:gradient-bg data-[state=active]:text-white gap-1.5"><Icon name="Cpu" size={15} /> Провайдеры</TabsTrigger>
          <TabsTrigger value="messages" className="data-[state=active]:gradient-bg data-[state=active]:text-white gap-1.5"><Icon name="MessageSquare" size={15} /> Сообщения</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="animate-fade-in">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass border-white/10">
              <CardContent className="p-6">
                <h3 className="font-display font-bold text-lg mb-5">Генерации по дням</h3>
                <div className="flex items-end gap-3 h-48">
                  {stats?.by_day.length ? stats.by_day.map((d) => (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full gradient-bg rounded-t-lg transition-all" style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: '4px' }} />
                      <span className="text-xs text-muted-foreground">{d.day}</span>
                    </div>
                  )) : <p className="text-muted-foreground text-sm">Нет данных</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardContent className="p-6">
                <h3 className="font-display font-bold text-lg mb-5">По провайдерам</h3>
                <div className="space-y-4">
                  {stats?.by_provider.length ? stats.by_provider.map((p) => {
                    const total = stats.by_provider.reduce((s, x) => s + x.count, 0) || 1;
                    return (
                      <div key={p.provider}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize font-medium">{p.provider || 'неизвестно'}</span>
                          <span className="text-muted-foreground">{p.count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full gradient-bg" style={{ width: `${(p.count / total) * 100}%` }} />
                        </div>
                      </div>
                    );
                  }) : <p className="text-muted-foreground text-sm">Нет данных</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="animate-fade-in">
          <Card className="glass border-white/10">
            <CardContent className="p-2 sm:p-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Пользователь</TableHead>
                    <TableHead className="hidden md:table-cell">Генераций</TableHead>
                    <TableHead>Кредиты</TableHead><TableHead>Роль</TableHead>
                    <TableHead>Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-8 h-8"><AvatarFallback className="bg-secondary text-xs">{u.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                          <div>
                            <div className="font-medium text-sm">{u.name}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{u.images}</TableCell>
                      <TableCell>
                        <Input type="number" defaultValue={u.credits} className="w-20 h-8 bg-input/60"
                          onBlur={(e) => { const v = parseInt(e.target.value); if (v !== u.credits) updateUser(u.id, { credits: v }); }} />
                      </TableCell>
                      <TableCell>
                        <Select value={u.role} onValueChange={(v) => updateUser(u.id, { role: v })}>
                          <SelectTrigger className="w-28 h-8 bg-input/60"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Пользователь</SelectItem>
                            <SelectItem value="admin">Админ</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch checked={!u.is_blocked} onCheckedChange={(v) => updateUser(u.id, { is_blocked: !v })} />
                          <span className="text-xs text-muted-foreground">{u.is_blocked ? 'Заблокирован' : 'Активен'}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="animate-fade-in">
          <div className="grid sm:grid-cols-2 gap-4">
            {providers.map((p) => (
              <Card key={p.id} className="glass border-white/10">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center"><Icon name="Cpu" size={18} className="text-white" /></div>
                      <div>
                        <div className="font-display font-bold">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.secret_name || 'без ключа'}</div>
                      </div>
                    </div>
                    <Switch checked={p.is_active} onCheckedChange={(v) => updateProvider(p, { is_active: v })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Модель</label>
                      <Input defaultValue={p.model} className="h-8 bg-input/60 text-xs"
                        onBlur={(e) => { if (e.target.value !== p.model) updateProvider(p, { model: e.target.value }); }} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Цена (кредиты)</label>
                      <Input type="number" defaultValue={p.credit_cost} className="h-8 bg-input/60 text-xs"
                        onBlur={(e) => { const v = parseInt(e.target.value); if (v !== p.credit_cost) updateProvider(p, { credit_cost: v }); }} />
                    </div>
                  </div>
                  <Badge variant="outline" className={p.is_active ? 'border-accent/40 text-accent' : 'border-border text-muted-foreground'}>
                    {p.is_active ? 'Активен' : 'Отключён'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            <Icon name="Info" size={12} className="inline mr-1" />
            Чтобы провайдер реально генерировал, добавьте его API-ключ в секреты проекта (имя секрета указано под названием).
          </p>
        </TabsContent>

        <TabsContent value="messages" className="animate-fade-in">
          <Card className="glass border-white/10">
            <CardContent className="p-2 sm:p-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Имя</TableHead><TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead>Тема</TableHead><TableHead className="text-right">Дата</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Сообщений пока нет</TableCell></TableRow>
                  ) : messages.map((m) => (
                    <Dialog key={m.id}>
                      <DialogTrigger asChild>
                        <TableRow className="border-border cursor-pointer" onClick={() => setMsgView(m)}>
                          <TableCell className="font-medium">{m.name}</TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">{m.email}</TableCell>
                          <TableCell className="text-muted-foreground max-w-[150px] truncate">{m.subject || '—'}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">{m.created_at?.slice(0, 10)}</TableCell>
                        </TableRow>
                      </DialogTrigger>
                      <DialogContent className="glass border-white/10">
                        <DialogHeader><DialogTitle className="font-display">{msgView?.subject || 'Сообщение'}</DialogTitle></DialogHeader>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-muted-foreground">От:</span> {msgView?.name} ({msgView?.email})</p>
                          <p className="text-foreground bg-secondary/40 rounded-lg p-4">{msgView?.message}</p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
