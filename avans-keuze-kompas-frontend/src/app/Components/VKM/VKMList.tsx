"use client";

import { useEffect, useState } from "react";
import { getItems, deleteItem } from "../../lib/api";
import VKMForm from "./VKMForm";
import VKMModal from "./VKMModal";
import { VKM } from "@/app/types/VKM";

export default function VKMList() {
  const [vkms, setVkms] = useState<VKM[]>([]);
  const [editing, setEditing] = useState<VKM | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    try {
      const data = await getItems();
      setVkms(data);
    } catch (err) {
      alert("Failed to load VKMs");
    }
  }

  async function handleDelete(_id: number | string) {
    if (!confirm("Are you sure you want to delete this VKM?")) return;
    await deleteItem(String(_id));
    load();
  }

  useEffect(() => {
    load();
  }, []);

  const openCreateModal = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEditModal = (vkm: VKM) => {
    setEditing(vkm);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">All VKMs</h2>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          + Add VKM
        </button>
      </div>

      <ul className="divide-y">
        {vkms.map((vkm) => (
          <li key={vkm._id} className="py-4 flex justify-between items-start">
            <div>
              <h4 className="font-medium">{vkm.shortdescription}</h4>
              <p className="text-sm text-gray-600">{vkm.content}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openEditModal(vkm)}
                className="text-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(vkm._id)}
                className="text-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <VKMModal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <h3 className="text-lg font-semibold mb-4">
          {editing ? "Edit VKM" : "Create New VKM"}
        </h3>
        <VKMForm
          initialData={editing ?? undefined}
          onSuccess={() => {
            setModalOpen(false);
            setEditing(null);
            load();
          }}
        />
      </VKMModal>
    </div>
  );
}
