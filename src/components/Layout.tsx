
import BottomNavigation from "./BottomNavigation";
import Header from "./Header";
import EnvironmentBanner from "./EnvironmentBanner";
import { Outlet } from "react-router-dom";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <EnvironmentBanner />
      <Header />
      <main className="pb-20 md:pb-8">
        {children ?? <Outlet />}
      </main>
      {/* <BottomNavigation /> */}
    </div>
  );
};

export default Layout;
