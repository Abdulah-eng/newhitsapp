"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Upload, FileText, X, CheckCircle, AlertCircle, Download } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_size: number | null;
  file_type: string | null;
  access_level: "free" | "members_only";
  category: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminResourcesPage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createSupabaseBrowserClient();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    access_level: "free" as "free" | "members_only",
    category: "",
    file: null as File | null,
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchResources();
    }
  }, [user, authLoading]);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error: any) {
      console.error("Error fetching resources:", error);
      setMessage({ type: "error", text: "Failed to load resources" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      setMessage({ type: "error", text: "Please select a file" });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      // Upload file to Supabase Storage
      const fileExt = formData.file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `resources/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("resources")
        .upload(filePath, formData.file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage.from("resources").getPublicUrl(filePath);
      const fileUrl = urlData.publicUrl;

      // Insert resource record
      const { error: insertError } = await supabase.from("resources").insert({
        title: formData.title,
        description: formData.description || null,
        file_url: fileUrl,
        file_name: formData.file.name,
        file_size: formData.file.size,
        file_type: fileExt,
        access_level: formData.access_level,
        category: formData.category || null,
        created_by: user?.id,
        is_active: true,
      });

      if (insertError) throw insertError;

      setMessage({ type: "success", text: "Resource uploaded successfully!" });
      setFormData({
        title: "",
        description: "",
        access_level: "free",
        category: "",
        file: null,
      });
      setShowForm(false);
      fetchResources();
    } catch (error: any) {
      console.error("Error uploading resource:", error);
      setMessage({ type: "error", text: error.message || "Failed to upload resource" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    try {
      // Extract file path from URL
      const urlParts = fileUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `resources/${fileName}`;

      // Delete from storage
      await supabase.storage.from("resources").remove([filePath]);

      // Delete from database
      const { error } = await supabase.from("resources").delete().eq("id", id);

      if (error) throw error;

      setMessage({ type: "success", text: "Resource deleted successfully!" });
      fetchResources();
    } catch (error: any) {
      console.error("Error deleting resource:", error);
      setMessage({ type: "error", text: "Failed to delete resource" });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("resources")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      fetchResources();
    } catch (error: any) {
      console.error("Error updating resource:", error);
      setMessage({ type: "error", text: "Failed to update resource" });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div initial="initial" animate="animate" variants={fadeIn}>
        <div className="flex items-center justify-between mb-8">
          <motion.div variants={slideUp}>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Resource Management</h1>
            <p className="text-text-secondary">Upload and manage downloadable resources for clients</p>
          </motion.div>
          <motion.div variants={slideUp}>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-primary-500 hover:bg-primary-600"
            >
              <Upload size={18} className="mr-2" />
              {showForm ? "Cancel" : "Upload Resource"}
            </Button>
          </motion.div>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-error-50 border border-error-200 text-error-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="ml-auto"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-white rounded-xl border border-secondary-200 p-6 shadow-soft"
          >
            <h2 className="text-xl font-bold text-text-primary mb-4">Upload New Resource</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Quick Reference: Video Calls"
              />
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
                  rows={3}
                  placeholder="Short description of the resource"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">
                    Access Level
                  </label>
                  <select
                    name="access_level"
                    value={formData.access_level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        access_level: e.target.value as "free" | "members_only",
                      })
                    }
                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
                    required
                  >
                    <option value="free">Free (Public)</option>
                    <option value="members_only">Members Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-primary mb-2">
                    Category (Optional)
                  </label>
                  <Input
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Safety, Getting Started"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">
                  File (PDF, DOC, DOCX)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  required
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
                {formData.file && (
                  <p className="mt-2 text-sm text-text-secondary">
                    Selected: {formData.file.name} ({(formData.file.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
              <div className="flex gap-4">
                <Button
                  type="submit"
                  isLoading={isUploading}
                  className="bg-primary-500 hover:bg-primary-600"
                >
                  <Upload size={18} className="mr-2" />
                  Upload Resource
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({
                      title: "",
                      description: "",
                      access_level: "free",
                      category: "",
                      file: null,
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        <motion.div variants={slideUp} className="bg-white rounded-xl border border-secondary-200 shadow-soft">
          <div className="p-6 border-b border-secondary-200">
            <h2 className="text-xl font-bold text-text-primary">All Resources</h2>
          </div>
          <div className="p-6">
            {resources.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-text-tertiary mb-4" />
                <p className="text-text-secondary">No resources uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="text-primary-500" />
                        <div>
                          <h3 className="font-semibold text-text-primary">{resource.title}</h3>
                          {resource.description && (
                            <p className="text-sm text-text-secondary mt-1">{resource.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-text-tertiary">
                            <span>
                              {resource.access_level === "free" ? "Free" : "Members Only"}
                            </span>
                            {resource.category && <span>• {resource.category}</span>}
                            {resource.file_size && (
                              <span>• {(resource.file_size / 1024).toFixed(2)} KB</span>
                            )}
                            <span
                              className={`${
                                resource.is_active ? "text-green-600" : "text-error-600"
                              }`}
                            >
                              {resource.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={resource.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                        title="Download"
                      >
                        <Download size={18} />
                      </a>
                      <button
                        onClick={() => toggleActive(resource.id, resource.is_active)}
                        className={`p-2 rounded ${
                          resource.is_active
                            ? "text-yellow-600 hover:bg-yellow-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                        title={resource.is_active ? "Deactivate" : "Activate"}
                      >
                        {resource.is_active ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => handleDelete(resource.id, resource.file_url)}
                        className="p-2 text-error-600 hover:bg-error-50 rounded"
                        title="Delete"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

