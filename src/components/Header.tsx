
import { Search, Menu, LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import ThemeToggle from "./ThemeToggle";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const Header = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/busqueda?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="rounded-lg flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-20 block dark:hidden"
              />
              <img
                src="/logo-blanco.png"
                alt="Logo blanco"
                className="w-20 hidden dark:block"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="search"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
              </div>
            </form>
          </div>

          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="h-5 w-5 text-gray-700 dark:text-white" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <ProfileSheetContent setOpen={setOpen} />
                </SheetContent>
              </Sheet>
            ) : (
              <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/login")}>
                <User className="h-5 w-5 text-gray-700 dark:text-white" />
              </Button>
            )}

            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => navigate("/busqueda")}
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};


export const ProfileSheetContent = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    toast.success("Sesión cerrada correctamente");
  }

  return (
    <>
      <SheetHeader className="pb-4 border-b border-[#D8D3CA]">
        <SheetTitle className="text-[#8B3740] dark:text-[#D8D3CA] font-bold tracking-wide text-xl">
          {user?.nombre} {user?.apellido}
        </SheetTitle>
      </SheetHeader>

      <div className="flex flex-col gap-3 mt-6">
        <Button
          variant="ghost"
          className="justify-start gap-4 p-4 rounded-md text-[#4B4B4C] dark:text-[#D8D3CA] hover:bg-[#8B3740] hover:text-white font-medium text-lg transition-colors duration-200"
          onClick={() => {
            setOpen(false);
            navigate("/perfil");
          }}
        >
          <User className="w-8 h-8" strokeWidth={1.5} />
          <span>Perfil</span>
        </Button>

        <Button
          variant="ghost"
          className="justify-start gap-4 p-4 rounded-md text-[#4B4B4C] dark:text-[#D8D3CA] hover:bg-[#8B3740] hover:text-white font-medium text-lg transition-colors duration-200"
          onClick={handleLogout}
        >
          <LogOut className="w-8 h-8" strokeWidth={1.5} />
          <span>Cerrar sesión</span>
        </Button>
      </div>
    </>
  )
}

export default Header;
