import { useEffect, useState } from "react";
import { supabaseClient } from "../../lib/supabase";
import { showError, showSuccess } from "../../utils/alertFeedback";
import "../../styles/my-collection/my-collection-edition-modal.css";

const LANGUAGE_OPTIONS = [
  "Inglês",
  "Japonês",
  "Francês",
  "Espanhol",
  "Italiano",
];

export default function MyCollectionEditionModal({
  onClose,
  seriesId,
  metadata,
  onSaved,
}) {
  const [publisher, setPublisher] = useState("");
  const [language, setLanguage] = useState("");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {

    setPublisher(metadata?.edition_publisher ?? "");
    setLanguage(metadata?.edition_language ?? "");
    setNotes(metadata?.edition_notes ?? "");
  }, [open, metadata]);

  if (!open) return null;

  async function handleSave() {
    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      const isEmpty = !publisher.trim() && !language && !notes.trim();

      if (isEmpty) {
        await supabaseClient
          .from("user_series_metadata")
          .delete()
          .eq("user_id", user.id)
          .eq("series_id", seriesId);

        onSaved(null);

        showSuccess("Personalização removida.");

        onClose();

        return;
      }

      const payload = {
        user_id: user.id,
        series_id: seriesId,

        edition_publisher: publisher.trim() || null,
        edition_language: language || null,
        edition_notes: notes.trim() || null,
      };

      const { error } = await supabaseClient
        .from("user_series_metadata")
        .upsert(payload, {
          onConflict: "user_id,series_id",
        });

      if (error) throw error;

      const savedMetadata = {
        edition_publisher: payload.edition_publisher,
        edition_language: payload.edition_language,
        edition_notes: payload.edition_notes,
      };

      onSaved(savedMetadata);

      showSuccess("Coleção atualizada com sucesso!");

      onClose();
    } catch (error) {
      console.error(error);

      showError("Não foi possível salvar a coleção.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="my-edition-modal-overlay" onClick={onClose}>
      <div className="my-edition-modal" onClick={(e) => e.stopPropagation()}>
        <h2>🌎 Personalizar coleção</h2>

        <p className="edition-description">
          Personalize esta coleção caso você possua uma edição diferente da
          utilizada como referência no catálogo.
        </p>

        <div className="edition-field">
          <label>Editora</label>

          <input
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            maxLength={80}
            placeholder="Ex.: Viz Media"
          />
        </div>

        <div className="edition-field">
          <label>Idioma</label>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="">🇧🇷 Português (Padrão)</option>

            {LANGUAGE_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="edition-field">
          <label>Observações</label>

          <textarea
            rows={5}
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex.: Coleção americana da Viz Media equivalente à edição Gold da Panini."
          />

          <small>{notes.length}/500</small>
        </div>

        <div className="edition-actions">
          <button
            className="edition-cancel-btn"
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>

          <button
            className="edition-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
