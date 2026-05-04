'use client';

import React, { useState } from 'react';
import PosterEditor from '@/components/canvas/PosterEditor';
import cn from 'classnames';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Icon from '@/components/Icon';

export default function NewEventPage() {
  const [name, setName] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState(0);
  const [paymentNumber, setPaymentNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async ({ backgroundImageUrl, zones, designWidth, designHeight }) => {
    if (!name) {
      toast.error('Veuillez donner un nom à l\'événement');
      return;
    }
    if (!backgroundImageUrl) {
      toast.error('Veuillez uploader une image de fond');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          backgroundImageUrl,
          zones,
          designWidth,
          designHeight,
          isPaid,
          price,
          paymentNumber,
        }),
      });


      if (res.ok) {
        toast.success('Événement créé avec succès !');
        router.push('/dashboard/events');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      toast.error('Erreur réseau');
    }
    setLoading(false);
  };

  return (
    <div className="w-full">
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-dark dark:text-white">Nouvel Événement</h2>
      </div>

      <div className="bg-white dark:bg-dark-2 p-8 rounded-xl border border-stroke dark:border-white/10 shadow-1 mb-8">
        <div className="mb-6">
          <label className="mb-3 block text-base font-medium text-dark dark:text-white">
            Nom de l'événement
          </label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Conférence Tech 2026"
            className="w-full rounded-md border-[1.5px] border-stroke bg-transparent py-3 px-5 text-base text-body-color outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter"
          />
        </div>
        
        <div className="flex flex-wrap gap-6 items-center">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={cn(
              "w-6 h-6 rounded border-2 flex items-center justify-center transition-all", 
              isPaid ? "bg-primary border-primary" : "border-stroke group-hover:border-primary"
            )}>
              {isPaid && <Icon name="check" size="14" fill="#FFF" />}
            </div>
            <input type="checkbox" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} className="hidden" />
            <span className="font-bold text-sm text-dark dark:text-white">Affiche payante</span>
          </label>
          
          {isPaid && (
            <div className="flex flex-wrap gap-4 transition-all duration-300">
              <input 
                type="number" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Prix (FCFA)"
                className="w-40 rounded-md border-[1.5px] border-stroke bg-transparent py-3 px-5 text-base text-body-color outline-none transition focus:border-primary active:border-primary"
              />
              <input 
                type="text" 
                value={paymentNumber} 
                onChange={(e) => setPaymentNumber(e.target.value)}
                placeholder="Numéro Mobile Money"
                className="w-64 rounded-md border-[1.5px] border-stroke bg-transparent py-3 px-5 text-base text-body-color outline-none transition focus:border-primary active:border-primary"
              />
            </div>
          )}
        </div>
      </div>

      <div className="min-h-[700px] mb-12">
        <PosterEditor onSave={handleSave} />
      </div>
      
      {loading && (
        <div className="fixed inset-0 bg-white/80 dark:bg-dark/80 backdrop-blur-sm flex flex-col items-center justify-center z-[1000] transition-opacity duration-200">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-xl font-bold text-dark dark:text-white">Création de l'événement en cours...</div>
        </div>
      )}
    </div>
  );
}
