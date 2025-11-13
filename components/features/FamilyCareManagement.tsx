"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Users, Plus, X, AlertCircle } from "lucide-react";
import { useMembership } from "@/lib/hooks/useMembership";
import { useAuth } from "@/lib/hooks/useAuth";

interface CoveredUser {
  id: string;
  full_name: string;
  email: string;
}

export default function FamilyCareManagement() {
  const { user } = useAuth();
  const { membership } = useMembership(user?.id);
  const supabase = createSupabaseBrowserClient();
  const [coveredUsers, setCoveredUsers] = useState<CoveredUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [error, setError] = useState("");
  const maxCovered = membership?.membership_plan?.max_covered_people || 3;

  useEffect(() => {
    if (membership?.covered_user_ids && membership.covered_user_ids.length > 0) {
      fetchCoveredUsers();
    } else {
      setIsLoading(false);
    }
  }, [membership]);

  const fetchCoveredUsers = async () => {
    if (!membership?.covered_user_ids || membership.covered_user_ids.length === 0) {
      setCoveredUsers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const { data, error: fetchError } = await supabase
      .from("users")
      .select("id, full_name, email")
      .in("id", membership.covered_user_ids);

    if (fetchError) {
      console.error("Error fetching covered users:", fetchError);
      setError("Failed to load covered users");
    } else {
      setCoveredUsers(data || []);
    }
    setIsLoading(false);
  };

  const handleAddUser = async () => {
    if (!newUserEmail.trim()) {
      setError("Please enter an email address");
      return;
    }

    setIsAdding(true);
    setError("");

    try {
      // Find user by email
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, full_name, email, role")
        .eq("email", newUserEmail.trim())
        .eq("role", "senior")
        .maybeSingle();

      if (userError || !userData) {
        setError("User not found. They must be a registered senior user.");
        setIsAdding(false);
        return;
      }

      if (userData.id === user?.id) {
        setError("You cannot add yourself as a covered user.");
        setIsAdding(false);
        return;
      }

      if (coveredUsers.length >= maxCovered) {
        setError(`You can only cover up to ${maxCovered} people with this plan.`);
        setIsAdding(false);
        return;
      }

      if (coveredUsers.some(u => u.id === userData.id)) {
        setError("This user is already covered by your membership.");
        setIsAdding(false);
        return;
      }

      // Add user to covered_user_ids
      const updatedIds = [...(membership?.covered_user_ids || []), userData.id];
      const { error: updateError } = await supabase
        .from("user_memberships")
        .update({ covered_user_ids: updatedIds })
        .eq("id", membership!.id);

      if (updateError) {
        setError("Failed to add user. Please try again.");
      } else {
        setNewUserEmail("");
        await fetchCoveredUsers();
      }
    } catch (err: any) {
      setError(err.message || "Failed to add user");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!membership) return;

    const updatedIds = membership.covered_user_ids.filter(id => id !== userId);
    const { error: updateError } = await supabase
      .from("user_memberships")
      .update({ covered_user_ids: updatedIds })
      .eq("id", membership.id);

    if (updateError) {
      setError("Failed to remove user. Please try again.");
    } else {
      await fetchCoveredUsers();
    }
  };

  if (!membership || membership.membership_plan?.plan_type !== "family_care_plus") {
    return null;
  }

  return (
    <div className="card bg-white p-6">
      <div className="flex items-center gap-3 mb-4">
        <Users className="text-primary-500" size={24} />
        <h3 className="text-lg font-semibold text-text-primary">
          Family Care+ - Covered Users
        </h3>
      </div>
      <p className="text-text-secondary mb-4 text-sm">
        Your plan covers up to {maxCovered} people. Add family members or household members to share your membership benefits.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="text-error-500 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-sm text-error-700">{error}</p>
        </div>
      )}

      {/* Covered Users List */}
      <div className="mb-4 space-y-2">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
          </div>
        ) : coveredUsers.length > 0 ? (
          coveredUsers.map((coveredUser) => (
            <div
              key={coveredUser.id}
              className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-text-primary">{coveredUser.full_name}</p>
                <p className="text-sm text-text-secondary">{coveredUser.email}</p>
              </div>
              <button
                onClick={() => handleRemoveUser(coveredUser.id)}
                className="p-1 text-error-500 hover:text-error-600 transition-colors"
                aria-label="Remove user"
              >
                <X size={18} />
              </button>
            </div>
          ))
        ) : (
          <p className="text-text-secondary text-sm text-center py-4">
            No covered users yet. Add family members below.
          </p>
        )}
      </div>

      {/* Add User Form */}
      {coveredUsers.length < maxCovered && (
        <div className="pt-4 border-t">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Add Family Member
          </label>
          <p className="text-xs text-text-secondary mb-3">
            Enter the email address of a registered senior user to add them to your plan.
          </p>
          <div className="flex gap-2">
            <Input
              type="email"
              value={newUserEmail}
              onChange={(e) => {
                setNewUserEmail(e.target.value);
                setError("");
              }}
              placeholder="family.member@example.com"
              className="flex-1"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddUser}
              isLoading={isAdding}
              disabled={!newUserEmail.trim()}
            >
              <Plus size={16} className="mr-1" />
              Add
            </Button>
          </div>
        </div>
      )}

      {coveredUsers.length >= maxCovered && (
        <p className="text-sm text-text-secondary text-center mt-4">
          You've reached the maximum of {maxCovered} covered users.
        </p>
      )}
    </div>
  );
}

