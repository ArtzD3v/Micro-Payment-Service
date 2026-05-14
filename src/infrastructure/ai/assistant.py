import sys
import json
import os
import google.generativeai as genai

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No prompt provided"}))
        sys.exit(1)

    prompt = sys.argv[1]
    api_key = os.environ.get("GEMINI_API_KEY")

    if not api_key:
        print(json.dumps({"success": False, "error": "GEMINI_API_KEY is not set"}))
        sys.exit(1)

    try:
        genai.configure(api_key=api_key)
        # Using the standard gemini model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        system_instruction = "You are a helpful virtual assistant for AuraPay, a micro-payment platform. Keep your answers concise, friendly, and under 3-4 short paragraphs. Answer questions about balance, transfers, deposits, and profile settings."
        
        full_prompt = f"System Instruction: {system_instruction}\n\nUser Question: {prompt}\n\nResponse:"
        
        response = model.generate_content(full_prompt)
        print(json.dumps({"success": True, "data": response.text}))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
