# RetroMorphism UI Templates

Diese Komponenten sind die Basistemplates fuer die Figma-Designsprache und sollen von neuen Features bevorzugt genutzt werden.

- `RetroButton.vue` -> Button Variants (Primary, Secondary, Ghost, Outline, Info, Success, Warning, Error, ErrorOutline) and sizes (`xs`, `sm`, `md`)
- `RetroInput.vue` -> Input-Feldbasis fuer Formulare mit Text-Label und optionalem Trailing-Slot
- `RetroSelect.vue` -> Select-Feld im Retro-Form-Stil mit Text-Label und Dropdown-Indikator
- `RetroTextarea.vue` -> Mehrzeiliges Retro-Eingabefeld mit konsistenter Feld-Shell
- `RetroCheckbox.vue` -> Checkbox-Feld im Retro-Stil mit Label-Layout
- `RetroFileInput.vue` -> Datei-Upload-Feld im Retro-Stil
- `RetroColorInput.vue` -> Kombiniertes Farb-Picker + Hex-Textfeld
- `RetroTag.vue` -> Tag/Badge Darstellung
- `RetroDropdown.vue` -> Dropdown Container-Shell
- `RetroOptionRow.vue` -> Optionen/Select-Zeilen innerhalb Menues
- `RetroModalTitle.vue` -> Titelblock fuer Modals

Empfehlung fuer internen Bereich:
- Form-Controls immer ueber diese Komponenten bauen, nicht ueber rohe `input/select/textarea/checkbox/file`.
- Standard ist ein ruhiges Feld-Layout mit Label oberhalb der Control; kein Badge-Label und keine linke Icon-Spalte.
- Bei dichten Layouts ueber `size="sm"`/`size="xs"` komprimieren.

Figma-Referenzknoten:

- Buttons: `12:10`
- Input: `34:1152`
- Drop menu: `39:31`
- Tag: `34:1311`
- Base modal title: `50:911`
