import tkinter as tk
import requests

class MinimalTranslator:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Minimal Translator")
        self.root.geometry("300x400")
        self.root.attributes('-topmost', True)
        
        # Input
        tk.Label(self.root, text="Input:", font=('Arial', 12, 'bold')).pack(pady=5)
        self.input_box = tk.Text(self.root, height=3, width=35)
        self.input_box.pack(pady=5)
        
        # Translate button
        tk.Button(self.root, text="TRANSLATE", command=self.translate, 
                 bg='blue', fg='white', font=('Arial', 12, 'bold')).pack(pady=10)
        
        # Output
        tk.Label(self.root, text="Output:", font=('Arial', 12, 'bold')).pack(pady=5)
        self.output_box = tk.Text(self.root, height=5, width=35, bg='lightgray')
        self.output_box.pack(pady=5)
        self.output_box.insert('1.0', 'Translation will appear here')
        
        # Status
        self.status = tk.Label(self.root, text="Ready", fg='green')
        self.status.pack(pady=5)
        
    def translate(self):
        text = self.input_box.get("1.0", tk.END).strip()
        if not text:
            self.output_box.delete("1.0", tk.END)
            self.output_box.insert("1.0", "Please enter text")
            return
            
        self.status.config(text="Translating...", fg='blue')
        self.root.update()
        
        try:
            response = requests.post("http://localhost:8001/translate", 
                                   json={"text": text, "src_lang": "ne_NP", "tgt_lang": "en_XX"},
                                   timeout=5)
            
            if response.status_code == 200:
                result = response.json()["translated_text"]
                self.output_box.delete("1.0", tk.END)
                self.output_box.insert("1.0", result)
                self.status.config(text="Done!", fg='green')
            else:
                self.output_box.delete("1.0", tk.END)
                self.output_box.insert("1.0", f"API Error: {response.status_code}")
                self.status.config(text="Failed", fg='red')
                
        except Exception as e:
            self.output_box.delete("1.0", tk.END)
            self.output_box.insert("1.0", f"Error: {str(e)}")
            self.status.config(text="Error", fg='red')
    
    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    app = MinimalTranslator()
    app.run()