from openai import OpenAI

client = OpenAI(
    base_url="http://132.199.137.208:27090/v1",
    api_key="vllm-key"
)

completion = client.chat.completions.create(
    model="google/gemma-3-27b-it",
    messages=[
        {
            "role": "user",
            "content": "Generate an example email address for a person named John Doe.",
        }
    ],
    extra_body={"structured_outputs": {"regex": r"Name: .+\\nAge: .+", "stop": ["\n"]}},
)

print(completion.choices[0].message.content)