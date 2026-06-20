import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/context/AuthContext';
import AuthDialog from '@/components/AuthDialog';

const NAV = [
  { label: 'Главная', path: '/' },
  { label: 'Генератор', path: '/generator' },
  { label: 'Галерея', path: '/gallery' },
  { label: 'Тарифы', path: '/pricing' },
  { label: 'Контакты', path: '/contacts' },
];

const Layout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);

  const initials = user?.name?.slice(0, 2).toUpperCase() || 'NA';

  const navLinks = (onClick?: () => void) =>
    NAV.map((item) => (
      <Link
        key={item.path}
        to={item.path}
        onClick={onClick}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          location.pathname === item.path
            ? 'text-foreground bg-secondary'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {item.label}
      </Link>
    ));

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 glass">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center glow">
              <Icon name="Sparkles" size={20} className="text-white" />
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight">NeuroArt</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">{navLinks()}</nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/generator">
                  <Badge variant="outline" className="hidden sm:flex border-accent/40 text-accent gap-1 cursor-pointer hover:bg-accent/10">
                    <Icon name="Zap" size={12} /> {user.credits} кредитов
                  </Badge>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="w-9 h-9 border-2 border-primary/50 cursor-pointer">
                      {user.avatar_url && <AvatarImage src={user.avatar_url} />}
                      <AvatarFallback className="bg-secondary text-sm">{initials}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass w-56">
                    <DropdownMenuLabel>
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-xs text-muted-foreground font-normal">{user.email}</div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <Icon name="User" size={16} className="mr-2" /> Профиль
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/history')}>
                      <Icon name="History" size={16} className="mr-2" /> История
                    </DropdownMenuItem>
                    {user.role === 'admin' && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Icon name="Shield" size={16} className="mr-2" /> Админпанель
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive">
                      <Icon name="LogOut" size={16} className="mr-2" /> Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => setAuthOpen(true)} className="gradient-bg text-white border-0 glow-hover">
                <Icon name="LogIn" size={16} className="mr-1.5" /> Войти
              </Button>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden border-border">
                  <Icon name="Menu" size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent className="glass border-white/10">
                <div className="flex flex-col gap-1 mt-8">{navLinks()}</div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border mt-auto">
        <div className="container py-8 grid sm:grid-cols-3 gap-6 items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
              <Icon name="Sparkles" size={15} className="text-white" />
            </div>
            <span className="font-display font-bold">NeuroArt</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">© 2026 NeuroArt — генерация изображений с ИИ</p>
          <div className="flex gap-2 sm:justify-end">
            {['Send', 'Github', 'Mail'].map((ic) => (
              <Button key={ic} size="icon" variant="outline" className="w-9 h-9 border-border">
                <Icon name={ic} size={16} />
              </Button>
            ))}
          </div>
        </div>
      </footer>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
};

export default Layout;
