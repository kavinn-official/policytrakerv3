
import PolicyList from "@/components/PolicyList";
import BackButton from "@/components/BackButton";

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
    </div>
  );
};

export default Policies;
