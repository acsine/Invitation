'use client';

import React, { useState } from 'react';
import PosterEditor from '@/components/canvas/PosterEditor';
import cn from 'classnames';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Icon from '@/components/Icon';
import FullPageLoader from '@/components/FullPageLoader';

export default function NewEventPage() {
  const [name, setName] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState(0);
  const [paymentNumber, setPaymentNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [customFields, setCustomFields] = useState([]);
  const [attendanceDays, setAttendanceDays] = useState(1);
  const router = useRouter();

  const addField = () => {
    setCustomFields([...customFields, { 
      id: Date.now(), 
      name: `field_${Date.now()}`, 
      label: '', 
      type: 'text', 
      required: true, 
      options: '' 
    }]);
  };

  const removeField = (id) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  const updateField = (id, updates) => {
    setCustomFields(customFields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

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
          customFields: JSON.stringify(customFields),
          attendanceDays: parseInt(attendanceDays) || 1,
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
        
        <div className="mt-8 pt-8 border-t border-stroke dark:border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-dark dark:text-white">Collecte de données invités</h3>
              <p className="text-sm text-body-color">Définissez les informations que vos invités doivent remplir</p>
            </div>
            <button 
              onClick={addField}
              type="button"
              className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold hover:bg-primary hover:text-white transition"
            >
              <Icon name="plus" size="18" /> Ajouter un champ
            </button>
          </div>

          <div className="space-y-4">
            {customFields.map((field) => (
              <div key={field.id} className="flex flex-wrap items-end gap-4 p-4 bg-gray-50 dark:bg-dark/50 rounded-xl border border-stroke dark:border-white/10 animate-in slide-in-from-left-4 duration-300">
                <div className="flex-1 min-w-[200px]">
                  <label className="mb-2 block text-xs font-black uppercase text-gray-400">Libellé du champ</label>
                  <input 
                    type="text" 
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                    placeholder="Ex: Entreprise, Profession..."
                    className="w-full rounded-md border border-stroke bg-white dark:bg-dark py-2 px-4 text-sm text-dark dark:text-white outline-none focus:border-primary"
                  />
                </div>
                
                <div className="w-40">
                  <label className="mb-2 block text-xs font-black uppercase text-gray-400">Type</label>
                  <select 
                    value={field.type}
                    onChange={(e) => updateField(field.id, { type: e.target.value })}
                    className="w-full rounded-md border border-stroke bg-white dark:bg-dark py-2 px-4 text-sm text-dark dark:text-white outline-none focus:border-primary"
                  >
                    <option value="text">Texte</option>
                    <option value="number">Nombre</option>
                    <option value="checkbox">Case à cocher</option>
                    <option value="select">Liste déroulante</option>
                  </select>
                </div>

                {field.type === 'select' && (
                  <div className="flex-1 min-w-[200px]">
                    <label className="mb-2 block text-xs font-black uppercase text-gray-400">Options (séparées par des virgules)</label>
                    <input 
                      type="text" 
                      value={field.options}
                      onChange={(e) => updateField(field.id, { options: e.target.value })}
                      placeholder="Option 1, Option 2..."
                      className="w-full rounded-md border border-stroke bg-white dark:bg-dark py-2 px-4 text-sm text-dark dark:text-white outline-none focus:border-primary"
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 h-[38px] px-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center transition-all", 
                      field.required ? "bg-primary border-primary" : "border-stroke group-hover:border-primary"
                    )}>
                      {field.required && <Icon name="check" size="12" fill="#FFF" />}
                    </div>
                    <input 
                      type="checkbox" 
                      checked={field.required} 
                      onChange={(e) => updateField(field.id, { required: e.target.checked })} 
                      className="hidden" 
                    />
                    <span className="text-xs font-bold text-dark dark:text-white">Obligatoire</span>
                  </label>
                </div>

                <button 
                  onClick={() => removeField(field.id)}
                  type="button"
                  className="w-[38px] h-[38px] flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Icon name="trash" size="18" />
                </button>
              </div>
            ))}

            {customFields.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-stroke dark:border-white/10 rounded-xl text-gray-400 font-medium">
                Aucun champ personnalisé défini
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-stroke dark:border-white/10">
            <label className="mb-3 block text-base font-medium text-dark dark:text-white">
              Nombre de jours de l'événement (pour le rapport de présence)
            </label>
            <input 
              type="number" 
              min="1"
              value={attendanceDays} 
              onChange={(e) => setAttendanceDays(e.target.value)}
              className="w-32 rounded-md border-[1.5px] border-stroke bg-transparent py-3 px-5 text-base text-body-color outline-none transition focus:border-primary"
            />
          </div>
        </div>
      </div>

      <div className="min-h-[700px] mb-12">
        <PosterEditor onSave={handleSave} loading={loading} />
      </div>

      {loading && <FullPageLoader message="Création de l'événement en cours..." />}
    </div>
  );
}
