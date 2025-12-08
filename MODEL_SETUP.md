# Model Setup Instructions

The translation models are not included in this repository due to their large size.

## Required Model Files

### Backend Model Directory (`backend/model/`)
- `adapter_model.safetensors`
- `adapter_config.json`
- `tokenizer.json`
- `tokenizer_config.json`
- `special_tokens_map.json`
- `sentencepiece.bpe.model`

### Merged Model Directory (`merged_model/`)
- `model.safetensors`
- `config.json`
- `generation_config.json`
- `tokenizer.json`
- `tokenizer_config.json`
- `special_tokens_map.json`
- `sentencepiece.bpe.model`

## Setup Instructions

1. Download or train your translation models
2. Place the model files in the respective directories as listed above
3. Ensure the backend can access the models before starting the server

## Note

These model files are excluded from version control due to their large size (>1GB total).
Consider using Git LFS or external storage for model distribution.