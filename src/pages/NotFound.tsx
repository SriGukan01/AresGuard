import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Shield, Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F6F8] p-4 font-sans text-[#243447]">
      <div className="max-w-md w-full bg-white rounded-lg border border-[#DCE3EA] p-8 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-lg bg-[#173B5E]/10 border border-[#173B5E]/20 text-[#173B5E] flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6 text-[#173B5E]" />
        </div>

        <div>
          <h1 className="text-3xl font-black text-[#173B5E] tracking-tight">404</h1>
          <h2 className="text-base font-bold text-[#243447] mt-1">Resource Not Found</h2>
          <p className="text-xs text-[#64748B] mt-1">
            The requested emergency portal endpoint does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="default"
            className="w-full bg-[#173B5E] hover:bg-[#122e49] text-white font-bold h-10 gap-2"
            onClick={() => navigate('/')}
          >
            <Home className="w-4 h-4" />
            <span>Return to National Portal</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
