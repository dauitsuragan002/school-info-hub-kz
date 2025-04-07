
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Application</h1>
        <p className="text-xl text-gray-600 mb-8">Start exploring or manage your data from the admin panel</p>
        
        <Button asChild>
          <Link to="/admin">Go to Admin Panel</Link>
        </Button>
      </div>
    </div>
  );
};

export default Index;
