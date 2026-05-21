// Source: `src/app/(customer)/settings/CustomerSettingsForm.tsx`

"use client";

import { useState } from "react";
import { saveCustomerSettings } from "@/features/customers/actions/saveCustomerSettings";
import { updateCustomerEmail } from "@/features/customers/actions/updateCustomerEmail";
import { updateCustomerPassword } from "@/features/customers/actions/updateCustomerPassword";
import { uploadCustomerPhoto } from "@/features/customers/actions/uploadCustomerPhoto";
import { DeleteAccountControl } from "@/features/auth/components/DeleteAccountControl";

type NotificationPreferences = {
  order_updates: boolean;
  promotions: boolean;
};

type CustomerSettingsFormProps = {
  initialName: string;
  initialEmail: string;
  initialContactNumber: string;
  initialShippingAddress: string;
  initialProfilePhotoUrl: string;
  initialNotificationPreferences: NotificationPreferences;
};

export default function CustomerSettingsForm({
  initialName,
  initialEmail,
  initialContactNumber,
  initialShippingAddress,
  initialProfilePhotoUrl,
  initialNotificationPreferences,
}: CustomerSettingsFormProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [contactNumber, setContactNumber] = useState(initialContactNumber);
  const [shippingAddress, setShippingAddress] = useState(initialShippingAddress);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(initialProfilePhotoUrl);
  const [notificationPrefs, setNotificationPrefs] = useState(
    initialNotificationPreferences
  );

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileStatus, setProfileStatus] = useState("");
  const [authStatus, setAuthStatus] = useState("");
  const [photoStatus, setPhotoStatus] = useState("");

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  async function handleSaveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileStatus("");
    setIsSavingProfile(true);

    try {
      const result = await saveCustomerSettings({
        name,
        contactNumber,
        shippingAddress,
        profilePhotoUrl,
        notificationPreferences: notificationPrefs,
      });

      if (!result.ok) {
        throw new Error(result.message);
      }

      setProfileStatus("Profile details saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save profile.";
      setProfileStatus(message);
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleEmailUpdate() {
    setAuthStatus("");
    setIsUpdatingEmail(true);

    try {
      const result = await updateCustomerEmail(email);
      if (!result.ok) {
        throw new Error(result.message);
      }

      setAuthStatus(result.message);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update email.";
      setAuthStatus(message);
    } finally {
      setIsUpdatingEmail(false);
    }
  }

  async function handlePasswordUpdate() {
    setAuthStatus("");

    if (!newPassword || !confirmPassword) {
      setAuthStatus("Enter and confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setAuthStatus("Passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const result = await updateCustomerPassword(newPassword);
      if (!result.ok) {
        throw new Error(result.message);
      }

      setAuthStatus(result.message);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update password.";
      setAuthStatus(message);
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  async function handleProfilePhotoUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setPhotoStatus("");

    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.set("photo", file);
      const result = await uploadCustomerPhoto(formData);

      if (!result.ok) {
        throw new Error(result.message);
      }

      setProfilePhotoUrl(result.publicUrl);
      setPhotoStatus("Photo uploaded. Save profile to persist this change.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to upload photo. Check storage bucket setup.";
      setPhotoStatus(message);
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  return (
    <form
      onSubmit={handleSaveProfile}
      className="mt-6 space-y-8 rounded-2xl border border-[#eadfd8] bg-white p-6 shadow-sm"
    >
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[#2f6b4f]">Basic Information</h2>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#363636]">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-md border border-[#d7cdc6] bg-[#fffaf7] px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#363636]">
            Contact Number
          </label>
          <input
            type="text"
            value={contactNumber}
            onChange={(event) => setContactNumber(event.target.value)}
            className="w-full rounded-md border border-[#d7cdc6] bg-[#fffaf7] px-3 py-2"
            placeholder="e.g. 0917 123 4567"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[#2f6b4f]">Address</h2>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#363636]">
            Shipping Address
          </label>
          <textarea
            value={shippingAddress}
            onChange={(event) => setShippingAddress(event.target.value)}
            className="w-full rounded-md border border-[#d7cdc6] bg-[#fffaf7] px-3 py-2"
            rows={3}
            placeholder="Street, city, province, postal code"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[#2f6b4f]">Profile Photo</h2>

        {profilePhotoUrl ? (
          <img
            src={profilePhotoUrl}
            alt="Profile"
            className="h-24 w-24 rounded-full border border-[#d7cdc6] object-cover"
          />
        ) : (
          <p className="text-sm text-[#555]">No profile photo uploaded yet.</p>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleProfilePhotoUpload}
          disabled={isUploadingPhoto}
          className="block w-full text-sm text-[#555]"
        />

        {photoStatus ? <p className="text-sm text-[#4f4f4f]">{photoStatus}</p> : null}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[#2f6b4f]">Notifications</h2>

        <label className="flex items-center gap-2 text-sm text-[#363636]">
          <input
            type="checkbox"
            checked={notificationPrefs.order_updates}
            onChange={(event) =>
              setNotificationPrefs((prev) => ({
                ...prev,
                order_updates: event.target.checked,
              }))
            }
          />
          Receive order status updates
        </label>

        <label className="flex items-center gap-2 text-sm text-[#363636]">
          <input
            type="checkbox"
            checked={notificationPrefs.promotions}
            onChange={(event) =>
              setNotificationPrefs((prev) => ({
                ...prev,
                promotions: event.target.checked,
              }))
            }
          />
          Receive promotional offers
        </label>
      </section>

      <section className="space-y-4 border-t border-[#efe6df] pt-6">
        <h2 className="text-xl font-semibold text-[#2f6b4f]">Security</h2>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#363636]">Email</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-[#d7cdc6] bg-[#fffaf7] px-3 py-2"
              required
            />
            <button
              type="button"
              onClick={handleEmailUpdate}
              disabled={isUpdatingEmail}
              className="rounded-md bg-[#2f6b4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#24513c] disabled:opacity-60"
            >
              {isUpdatingEmail ? "Updating..." : "Update Email"}
            </button>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#363636]">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full rounded-md border border-[#d7cdc6] bg-[#fffaf7] px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#363636]">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-md border border-[#d7cdc6] bg-[#fffaf7] px-3 py-2"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handlePasswordUpdate}
          disabled={isUpdatingPassword}
          className="rounded-md border border-[#2f6b4f] px-4 py-2 text-sm font-semibold text-[#2f6b4f] hover:bg-[#f1f8f4] disabled:opacity-60"
        >
          {isUpdatingPassword ? "Updating..." : "Update Password"}
        </button>

        {authStatus ? <p className="text-sm text-[#4f4f4f]">{authStatus}</p> : null}
      </section>

      <section className="flex items-center justify-between border-t border-[#efe6df] pt-6">
        {profileStatus ? <p className="text-sm text-[#4f4f4f]">{profileStatus}</p> : <span />}
        <button
          type="submit"
          disabled={isSavingProfile}
          className="rounded-md bg-[#d24b46] px-5 py-2 font-semibold text-white hover:bg-[#b53d39] disabled:opacity-60"
        >
          {isSavingProfile ? "Saving..." : "Save Changes"}
        </button>
      </section>

      <section className="mt-8 rounded-xl border border-[#f5d0cc] bg-[#fff7f6] p-5">
        <h2 className="text-lg font-semibold text-[#c0392b]">Delete account</h2>
        <p className="mt-1 text-sm text-[#6f6f6f]">
          Permanently remove your account and personal data. This cannot be undone.
        </p>
        <div className="mt-4">
          <DeleteAccountControl />
        </div>
      </section>
    </form>
  );
}
