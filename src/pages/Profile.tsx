import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth, api } from '@/context/AuthContext';

const Profile = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, public: 0, likes: 0 });

  useEffect(() => {
    if (user) {
      setName(user.name); setAvatar(user.avatar_url || '');
      api.history().then((d) => {
        const imgs = d.images || [];
        setStats({
          total: imgs.length,
          public: imgs.filter((i: { is_public: boolean }) => i.is_public).length,
          likes: imgs.reduce((s: number, i: { likes: number }) => s + (i.likes || 0), 0),
        });
      }).catch(() => {});
    }
  }, [user]);

  const save = async () => {
    setSaving(true);
    try {
      const { user: u } = await api.updateProfile({ name, avatar_url: avatar });
      setUser(u);
      toast({ title: 'Профиль обновлён' });
    } catch (e) {
      toast({ title: 'Ошибка', description: (e as Error).message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  if (!user) {
    return (
      <div className="container py-20 text-center">
        <Icon name="Lock" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
        <h2 className="font-display font-bold text-2xl mb-2">Требуется вход</h2>
        <Link to="/generator"><Button className="gradient-bg text-white border-0">Войти</Button></Link>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-4xl">
      <h1 className="font-display font-extrabold text-3xl mb-6">Профиль</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="glass border-white/10 md:col-span-1">
          <CardContent className="p-6 text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-primary/50">
              {avatar && <AvatarImage src={avatar} />}
              <AvatarFallback className="bg-secondary text-2xl">{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h2 className="font-display font-bold text-xl">{user.name}</h2>
            <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
            <div className="flex items-center justify-center gap-2">
              <Badge className="gradient-bg text-white border-0 capitalize">{user.plan}</Badge>
              {user.role === 'admin' && <Badge variant="outline" className="border-accent/40 text-accent">Админ</Badge>}
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card className="glass border-white/10">
            <CardContent className="p-6">
              <h3 className="font-display font-bold text-lg mb-4">Баланс кредитов</h3>
              <div className="flex items-end justify-between mb-2">
                <span className="font-display font-black text-4xl gradient-text">{user.credits}</span>
                <Link to="/pricing"><Button size="sm" className="gradient-bg text-white border-0"><Icon name="Plus" size={14} className="mr-1" /> Пополнить</Button></Link>
              </div>
              <Progress value={Math.min(user.credits / 5, 100)} className="h-2" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            {[
              { v: stats.total, l: 'Генераций', icon: 'Image' },
              { v: stats.public, l: 'В галерее', icon: 'Globe' },
              { v: stats.likes, l: 'Лайков', icon: 'Heart' },
            ].map((s) => (
              <Card key={s.l} className="glass border-white/10 text-center">
                <CardContent className="py-5">
                  <Icon name={s.icon} size={20} className="mx-auto mb-2 text-primary" />
                  <div className="font-display font-black text-2xl">{s.v}</div>
                  <div className="text-xs text-muted-foreground">{s.l}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass border-white/10">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-display font-bold text-lg">Редактировать профиль</h3>
              <div>
                <Label className="mb-1.5 block">Имя</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-input/60" />
              </div>
              <div>
                <Label className="mb-1.5 block">Ссылка на аватар</Label>
                <Input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." className="bg-input/60" />
              </div>
              <Button onClick={save} disabled={saving} className="gradient-bg text-white border-0">
                {saving ? <Icon name="Loader2" size={16} className="animate-spin" /> : 'Сохранить'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
