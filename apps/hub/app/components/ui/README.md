# UI Components

Base UI wrappers for the Guildora design system. Prefer these over raw form controls in new internal UI work.

- `UiButton.vue` — Button variants (Primary, Secondary, Ghost, Outline, Info, Success, Warning, Error, ErrorOutline) and sizes (`xs`, `sm`, `md`)
- `UiInput.vue` — Input field with text label and optional trailing slot
- `UiSelect.vue` — Select field with text label and dropdown indicator
- `UiTextarea.vue` — Multiline input with consistent field shell
- `UiCheckbox.vue` — Checkbox with label layout
- `UiFileInput.vue` — File upload field
- `UiColorInput.vue` — Combined color picker + hex text field
- `UiTag.vue` — Tag/badge display
- `UiDropdown.vue` — Dropdown container shell
- `UiOptionRow.vue` — Option/select rows within menus
- `UiModalTitle.vue` — Title block for modals

Guidelines:

- Form controls should always use these components, not raw `input/select/textarea/checkbox/file`
- Default is a clean field layout with label above the control
- Use `size="sm"` or `size="xs"` for dense layouts
