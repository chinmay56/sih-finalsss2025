import tkinter as tk
from tkinter import ttk
import requests

class SimpleTranslator:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Simple Translator")
        self.root.geometry("400x300")
        self.root.attributes('-topmost', True)
        
        # Input
        tk.Label(self.root, text="Input Text:", font=('Arial', 12)).pack(pady=5)
        self.input_text = tk.Text(self.root, height=3, font=('Arial', 11))
        self.input_text.pack(fill=tk.X, padx=10, pady=5)
        
        # Language selection
        lang_frame = tk.Frame(self.root)
        lang_frame.pack(pady=5)
        
        tk.Label(lang_frame, text="From:").pack(side=tk.LEFT)
        self.from_lang = ttk.Combobox(lang_frame, values=["English", "Nepali", "Sinhala"], width=10)
        self.from_lang.set("English")
        self.from_lang.pack(side=tk.LEFT, padx=5)
        
        tk.Label(lang_frame, text="To:").pack(side=tk.LEFT)
        self.to_lang = ttk.Combobox(lang_frame, values=["English", "Nepali", "Sinhala"], width=10)
        self.to_lang.set("Nepali")
        self.to_lang.pack(side=tk.LEFT, padx=5)
        
        # Translate button
        tk.Button(self.root, text="TRANSLATE", command=self.translate, 
                 bg='#8B4513', fg='white', font=('Arial', 12, 'bold')).pack(pady=10)
        
        # Output
        tk.Label(self.root, text="Translation:", font=('Arial', 12)).pack(pady=(10,5))
        self.output_text = tk.Text(self.root, height=3, font=('Arial', 11), bg='#F0F0F0')
        self.output_text.pack(fill=tk.X, padx=10, pady=5)
        
        # Status
        self.status = tk.Label(self.root, text="Ready", fg='green')
        self.status.pack(pady=5)
        
    def translate(self):
        text = self.input_text.get("1.0", tk.END).strip()
        if not text:
            self.status.config(text="Please enter text", fg='red')
            return
            
        self.status.config(text="Translating...", fg='blue')
        self.root.update()
        
        # Language mapping
        lang_map = {"English": "en_XX", "Nepali": "ne_NP", "Sinhala": "si_LK"}
        src = lang_map[self.from_lang.get()]
        tgt = lang_map[self.to_lang.get()]
        
        try:
            response = requests.post("http://localhost:8001/translate", 
                                   json={"text": text, "src_lang": src, "tgt_lang": tgt},
                                   timeout=10)
            
            if response.status_code == 200:
                result = response.json()["translated_text"]
                self.output_text.delete("1.0", tk.END)
                self.output_text.insert("1.0", result)
                self.status.config(text="Translation complete!", fg='green')
            else:
                self.output_text.delete("1.0", tk.END)
                self.output_text.insert("1.0", f"Error: {response.status_code}")
                self.status.config(text="Translation failed", fg='red')
                
        except requests.exceptions.ConnectionError:
            self.output_text.delete("1.0", tk.END)
            self.output_text.insert("1.0", "Cannot connect to server")
            self.status.config(text="Connection error", fg='red')
        except Exception as e:
            self.output_text.delete("1.0", tk.END)
            self.output_text.insert("1.0", f"Error: {str(e)}")
            self.status.config(text="Error occurred", fg='red')
    
    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    app = SimpleTranslator()
    app.run()