import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageSquare, Mail, Search, Edit, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const ClientList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Error",
        description: "Failed to load clients. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Loading clients...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold text-gray-900">Client Management</CardTitle>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={() => navigate("/add-client")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Client
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search clients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredClients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? "No clients found matching your search." : "No clients added yet. Add your first client to get started!"}
              </div>
            ) : (
              filteredClients.map((client) => (
                <div key={client.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-full">
                          <span className="text-white font-semibold text-sm">
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{client.name}</h3>
                          <p className="text-sm text-gray-600">{client.email}</p>
                          <p className="text-sm text-gray-600">{client.phone}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      {client.address && (
                        <div className="text-center max-w-xs">
                          <p className="text-sm font-medium text-gray-900 truncate">{client.address}</p>
                          <p className="text-xs text-gray-600">Address</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-6">
                      <Button size="sm" variant="outline" className="hover:bg-green-50 hover:border-green-200">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:border-blue-200">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="hover:bg-gray-50">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="hover:bg-yellow-50 hover:border-yellow-200">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientList;
