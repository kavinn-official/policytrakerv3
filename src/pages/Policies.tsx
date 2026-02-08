import PolicyList from "@/components/PolicyList";
import BackButton from "@/components/BackButton";
import BulkUpload from "@/components/BulkUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

const Policies = () => {
  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Policies</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage and track all your insurance policies</p>
          </div>
        </div>
      </div>

      <PolicyList />
      
      {/* Bulk Upload Section */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Upload className="h-5 w-5 text-purple-600" />
            Bulk Policy Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <BulkUpload />
        </CardContent>
      </Card>
    </div>
  );
};

export default Policies;
