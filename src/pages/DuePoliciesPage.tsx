
import DuePolicies from "@/components/DuePolicies";
import BackButton from "@/components/BackButton";

const DuePoliciesPage = () => {
  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Due Policies</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Policies expiring within the next 30 days</p>
          </div>
        </div>
      </div>

      <DuePolicies />
    </div>
  );
};

export default DuePoliciesPage;
