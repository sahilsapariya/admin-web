"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateProfile } from "@/services/authService";
import { Pencil } from "lucide-react";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [submitting, setSubmitting] = useState(false);

  const handleEditOpen = (open: boolean) => {
    setEditOpen(open);
    if (open && user) setName(user.name ?? "");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateProfile({ name: name.trim() || undefined });
      await refreshUser();
      setEditOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Your account information.</p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => handleEditOpen(true)}
        >
          <Pencil className="size-4" />
          Edit Profile
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>
            Profile management and settings. Picture upload coming in next
            phase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                <dd className="text-base">{user.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                <dd className="text-base">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Email Verified</dt>
                <dd className="text-base">{user.email_verified ? "Yes" : "No"}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">No user data.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={handleEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Email cannot be changed here.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
