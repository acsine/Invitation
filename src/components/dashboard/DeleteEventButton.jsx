'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Icon from '@/components/Icon';
import cn from 'classnames';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function DeleteEventButton({ eventId, eventName, className }) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Événement supprimé');
        setIsModalOpen(false);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur réseau');
    }
    setLoading(false);
  };

  const openModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <button 
        onClick={openModal} 
        className={cn(className, "flex items-center justify-center p-2 rounded-xl text-[#EF466F] hover:bg-[#EF466F]/10 active:scale-95 transition-all duration-200")}
        disabled={loading}
        title="Supprimer l'événement"
      >
        <Icon name="trash" size="20" />
      </button>

      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        eventName={eventName}
        loading={loading}
      />
    </>
  );
}
