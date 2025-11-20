"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations/config";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Upload, FileText, X, CheckCircle, AlertCircle, Download } from "lucide-react";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx"];

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
    files: [] as File[],
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
    if (e.target.files) {
      setFormData({ ...formData, files: Array.from(e.target.files) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.files.length) {
      setMessage({ type: "error", text: "Please select at least one file" });
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const invalidFile = formData.files.find((file) => {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) return true;
        if (file.size > MAX_FILE_SIZE) return true;
        return false;
      });

      if (invalidFile) {
        const ext = invalidFile.name.split(".").pop()?.toLowerCase();
        const reason =
          !ext || !ALLOWED_EXTENSIONS.includes(ext)
            ? `Unsupported file type: ${invalidFile.name}`
            : `File too large (max ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB): ${invalidFile.name}`;
        setMessage({ type: "error", text: reason });
        setIsUploading(false);
        return;
      }

      const uploads: string[] = [];

      for (const file of formData.files) {
        const fileExt = file.name.split(".").pop()?.toLowerCase();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `resources/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("resources")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("resources").getPublicUrl(filePath);
        const fileUrl = urlData.publicUrl;

        const { error: insertError } = await supabase.from("resources").insert({
          title: formData.title || file.name,
          description: formData.description || null,
          file_url: fileUrl,
          file_name: file.name,
          file_size: file.size,
          file_type: fileExt,
          access_level: formData.access_level,
          category: formData.category || null,
          created_by: user?.id,
          is_active: true,
        });

        if (insertError) throw insertError;
        uploads.push(file.name);
      }

      setMessage({
        type: "success",
        text:
          uploads.length === 1
            ? "Resource uploaded successfully!"
            : `Uploaded ${uploads.length} resources successfully!`,
      });
      setFormData({
        title: "",
        description: "",
        access_level: "free",
        category: "",
        files: [],
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
    if (!confirm("Are you sure you want to delete this resource? This action cannot be undone.")) return;

    try {
      setIsLoading(true);
      setMessage(null);

      // Extract file path from URL - handle different URL formats
      let filePath = "";
      
      try {
        // Try to extract from public URL format: https://...supabase.co/storage/v1/object/public/resources/resources/...
        if (fileUrl.includes("/storage/v1/object/public/resources/")) {
          const urlParts = fileUrl.split("/storage/v1/object/public/resources/");
          if (urlParts.length > 1) {
            filePath = urlParts[1].split("?")[0]; // Remove query params
            filePath = decodeURIComponent(filePath);
          }
        } 
        // Try signed URL format
        else if (fileUrl.includes("/storage/v1/object/sign/resources/")) {
          const urlParts = fileUrl.split("/storage/v1/object/sign/resources/");
          if (urlParts.length > 1) {
            filePath = urlParts[1].split("?")[0];
            filePath = decodeURIComponent(filePath);
          }
        }
        // Try direct path format
        else if (fileUrl.includes("resources/")) {
          const parts = fileUrl.split("resources/");
          if (parts.length > 1) {
            filePath = parts[parts.length - 1].split("?")[0];
            filePath = decodeURIComponent(filePath);
          }
        }

        // If we still don't have a path, try to get it from the database record
        if (!filePath) {
          const { data: resourceData } = await supabase
            .from("resources")
            .select("file_url")
            .eq("id", id)
            .single();
          
          if (resourceData?.file_url) {
            // Try extracting from the stored URL
            const storedUrl = resourceData.file_url;
            if (storedUrl.includes("/storage/v1/object/public/resources/")) {
              filePath = storedUrl.split("/storage/v1/object/public/resources/")[1]?.split("?")[0] || "";
              filePath = decodeURIComponent(filePath);
            }
          }
        }
      } catch (pathError) {
        console.warn("Error extracting file path:", pathError);
      }

      // Delete from storage if we have a valid path
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from("resources")
          .remove([filePath]);

        if (storageError) {
          console.warn("Storage deletion error (continuing with DB deletion):", storageError);
          // Continue with DB deletion even if storage deletion fails
        }
      } else {
        console.warn("Could not extract file path from URL, skipping storage deletion");
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("resources")
        .delete()
        .eq("id", id);

      if (dbError) throw dbError;

      setMessage({ type: "success", text: "Resource deleted successfully!" });
      await fetchResources();
    } catch (error: any) {
      console.error("Error deleting resource:", error);
      setMessage({ 
        type: "error", 
        text: error.message || "Failed to delete resource. Please try again." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      setMessage(null);
      const newStatus = !currentStatus;

      const { error } = await supabase
        .from("resources")
        .update({ is_active: newStatus })
        .eq("id", id);

      if (error) throw error;

      setMessage({ 
        type: "success", 
        text: `Resource ${newStatus ? "activated" : "deactivated"} successfully!` 
      });
      
      // Refresh the resources list
      await fetchResources();
    } catch (error: any) {
      console.error("Error updating resource:", error);
      setMessage({ 
        type: "error", 
        text: error.message || "Failed to update resource. Please try again." 
      });
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
                  Files (PDF, DOC, DOCX, PPT, XLS)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                  multiple
                  onChange={handleFileChange}
                  required
                  className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
                {formData.files.length > 0 && (
                  <div className="mt-2 text-sm text-text-secondary space-y-1">
                    {formData.files.map((file, idx) => (
                      <p key={idx}>
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </p>
                    ))}
                  </div>
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
                      files: [],
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
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                        title="Download"
                      >
                        <Download size={18} />
                      </a>
                      <button
                        onClick={() => toggleActive(resource.id, resource.is_active)}
                        disabled={isLoading}
                        className={`p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          resource.is_active
                            ? "text-yellow-600 hover:bg-yellow-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                        title={resource.is_active ? "Deactivate (Hide from users)" : "Activate (Show to users)"}
                      >
                        {resource.is_active ? "Hide" : "Show"}
                      </button>
                      <button
                        onClick={() => handleDelete(resource.id, resource.file_url)}
                        disabled={isLoading}
                        className="p-2 text-error-600 hover:bg-error-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete resource"
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

