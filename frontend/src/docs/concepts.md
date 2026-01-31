# Core Concepts

Structura is built on the principle of **Deterministic AI outputs**. This document explains the primary concepts that drive the application.

## Guided Generation

Unlike standard chat interfaces that rely on "prompt engineering" to receive structured data, Structura uses **Guided Generation**. This technology intercepting the model's token sampling process to ensure that only tokens following a predefined grammar (regex, JSON, etc.) are chosen.

This results in:
- **Zero Hallucinations** regarding format.
- **Improved Performance** for downstream tasks.
- **Reliable Integration** into software systems.

## Backends

Structura acts as a middleware between you and various LLM backends:

- **Local (Ollama/vLLM)**: Best for privacy and custom grammar constraints. Ollama and vLLM allow for strict regex and template enforcement at the token level.
- **Cloud (OpenAI)**: Industry standard for high-complexity tasks. Uses "Structured Outputs" to guarantee JSON schema compliance.

## Artifacts

An **Artifact** in Structura is a saved output specification.
- **JSON Schemas**: Definitions of objects, arrays, and types.
- **Regex Patterns**: String-level constraints (e.g., date formats, serial numbers).
- **Templates**: Predefined text frames with `[GEN]` markers for variable content.

## Persistence & State

Structura maintains your history and artifacts across sessions:
- **SQLite Database**: A lightweight database stores your conversations, user profile, and saved artifacts.
- **JWT Authentication**: Secure access to your personal workspace.
- **Auto-Save**: Changes to schemas and templates are saved in real-time as you edit them.

## The Generation Queue
Every request in Structura is streamed. This means you see the content as it is generated, even when using strict constraints. If a constraint is too complex, you may notice a slight delay as the backend prepares the grammar engine.
