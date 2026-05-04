'use client';

import React, { useState, useEffect, use } from 'react';
import PosterEditor from '@/components/canvas/PosterEditor';
import cn from 'classnames';
import styles from '../../Events.module.sass';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function BadgeTemplatePage({ params }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [template, setTemplate] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/events/${id}/badge`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setTemplate(data);
        setLoading(false);
      });
  }, [id]);

  const handleSave = async ({ backgroundImageUrl, zones }) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${id}/badge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backgroundImageUrl, zones }),
      });

      if (res.ok) {
        toast.success('Template de badge enregistré !');
      } else {
        toast.error('Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      toast.error('Erreur réseau');
    }
    setSaving(false);
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.head}>
        <h2 className={cn('h2', styles.title)}>Template de Badge</h2>
        <button onClick={() => router.push(`/dashboard/events/${id}`)} className="button-stroke button-small">
          Retour
        </button>
      </div>

      <p style={{ marginBottom: '32px', color: '#777E90' }}>
        Définissez le design du badge qui sera imprimé pour chaque invité. 
        Les zones seront remplies avec les informations des invités validés.
      </p>

      <div style={{ height: '600px' }}>
        <PosterEditor 
          initialData={template || {}} 
          onSave={handleSave} 
        />
      </div>

      {saving && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyCenter: 'center', zIndex: 1000 }}>
          <div className="h4">Enregistrement...</div>
        </div>
      )}
    </div>
  );
}
