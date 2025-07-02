import { Shield, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[hsl(207,90%,54%)] rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Sentinel AI</h1>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
              v2.1
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
