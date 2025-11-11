"use client";

import { useState, useEffect } from "react";
import { createItem, updateItem } from "../../lib/api";
import { VKM, VKMInput } from "@/app/types/VKM";

type Props = {
  onSuccess?: () => void;
  initialData?: VKM;
};

export default function VKMForm({ onSuccess, initialData }: Props) {
  const [formData, setFormData] = useState<VKMInput>({
  id: 0,
  name: "",
  shortdescription: "",
  content: "",
  studycredit: 0,
  location: "",
  contact_id: 0,
  level: "",
});

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id ?? 0,
        name: initialData.name,
        shortdescription: initialData.shortdescription ?? "",
        content: initialData.content ?? "",
        studycredit: initialData.studycredit ?? 0,
        location: initialData.location ?? "",
        contact_id: initialData.contact_id ?? 0,
        level: initialData.level ?? "",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "id" || name === "studycredit" || name === "contact_id"
          ? parseInt(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (initialData?._id) {
        // ✅ use MongoDB _id when updating
        await updateItem(initialData._id, formData);
      } else {
        await createItem(formData);
      }

      setFormData({
        id: 0,
        name: "",
        shortdescription: "",
        content: "",
        studycredit: 0,
        location: "",
        contact_id: 0,
        level: "",
      });

      onSuccess?.();
    } catch (err) {
      alert("Error saving VKM");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <label htmlFor="id">ID</label>
      <input
        name="id"
        type="number"
        className="w-full border p-2"
        value={formData.id}
        onChange={handleChange}
        placeholder="ID"
      />
      <label>KeuzeModule Naam</label>
      <input
        name="name"
        className="w-full border p-2"
        value={formData.name}
        onChange={handleChange}
        placeholder="name"
      />
      <label>Korte Beschrijving</label>
      <input
        name="shortdescription"
        className="w-full border p-2"
        value={formData.shortdescription}
        onChange={handleChange}
        placeholder="Short description"
      />
      <label>Inhoud</label>
      <textarea
        name="content"
        className="w-full border p-2"
        value={formData.content}
        onChange={handleChange}
        placeholder="Content"
      />
      <label htmlFor="studycredit">Studiepunten</label>
      <input
        name="studycredit"
        type="number"
        className="w-full border p-2"
        value={formData.studycredit}
        onChange={handleChange}
        placeholder="Study credit"
      />
      <label>Locatie</label>
      <input
        name="location"
        className="w-full border p-2"
        value={formData.location}
        onChange={handleChange}
        placeholder="Location"
      />
      <label>Contact ID</label>
      <input
        name="contact_id"
        type="number"
        className="w-full border p-2"
        value={formData.contact_id}
        onChange={handleChange}
        placeholder="Contact ID"
      />
      <label>Level</label>
      <input
        name="level"
        className="w-full border p-2"
        value={formData.level}
        onChange={handleChange}
        placeholder="Level"
      />
      <button
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
        type="submit"
      >
        {initialData ? "Update" : "Create"} VKM
      </button>
    </form>
  );
}
