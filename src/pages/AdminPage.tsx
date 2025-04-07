
import { FileUploadCard } from "@/components/admin/FileUploadCard";
import { InstructionCard } from "@/components/admin/InstructionCard";
import { DataTable } from "@/components/admin/DataTable";
import { useAdminData } from "@/hooks/useAdminData";

const AdminPage = () => {
  const { activeTab, setActiveTab, tableData, uploading, handleUpload } = useAdminData();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Мектеп Мәліметтерін Басқару Панелі</h1>
      
      <div className="grid gap-6 md:grid-cols-2 mb-10">
        <FileUploadCard
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onUpload={handleUpload}
          uploading={uploading}
        />
        <InstructionCard />
      </div>
      
      {/* Table section */}
      <DataTable activeTab={activeTab} tableData={tableData} />
    </div>
  );
};

export default AdminPage;
