import tkinter as tk
import requests

class AlwaysVisibleTranslator:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("TRANSLATOR - ALWAYS VISIBLE")
        self.root.geometry("600x700+100+100")
        self.root.attributes('-topmost', True)
        self.root.configure(bg='red')
        
        # Big title
        title = tk.Label(self.root, text="🌐 TRANSLATOR 🌐", 
                        font=('Arial', 24, 'bold'), 
                        bg='red', fg='white')
        title.pack(pady=20)
        
        # Input section
        input_frame = tk.Frame(self.root, bg='blue', bd=5, relief='raised')
        input_frame.pack(fill=tk.X, padx=20, pady=10)
        
        tk.Label(input_frame, text="INPUT TEXT:", 
                font=('Arial', 16, 'bold'), bg='blue', fg='white').pack(pady=5)
        
        self.input_text = tk.Text(input_frame, height=5, font=('Arial', 14), 
                                 bg='white', fg='black', bd=3, relief='solid')
        self.input_text.pack(fill=tk.X, padx=10, pady=10)
        
        # Language selection
        lang_frame = tk.Frame(self.root, bg='green', bd=5, relief='raised')
        lang_frame.pack(fill=tk.X, padx=20, pady=10)
        
        tk.Label(lang_frame, text="FROM:", font=('Arial', 14, 'bold'), 
                bg='green', fg='white').pack(side=tk.LEFT, padx=10)
        
        self.from_lang = tk.StringVar(value="Nepali")
        from_menu = tk.OptionMenu(lang_frame, self.from_lang, "English", "Nepali", "Sinhala")
        from_menu.config(font=('Arial', 12), bg='white')
        from_menu.pack(side=tk.LEFT, padx=10)
        
        tk.Label(lang_frame, text="TO: English", font=('Arial', 14, 'bold'), 
                bg='green', fg='white').pack(side=tk.RIGHT, padx=10)
        
        # Translate button
        self.translate_btn = tk.Button(self.root, text="🔄 TRANSLATE NOW 🔄", 
                                      command=self.translate,
                                      font=('Arial', 18, 'bold'),
                                      bg='orange', fg='black',
                                      bd=5, relief='raised',
                                      height=2)
        self.translate_btn.pack(pady=20, padx=20, fill=tk.X)
        
        # Output section - VERY VISIBLE
        output_frame = tk.Frame(self.root, bg='purple', bd=10, relief='raised')
        output_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        tk.Label(output_frame, text="🎯 TRANSLATION OUTPUT 🎯", 
                font=('Arial', 18, 'bold'), bg='purple', fg='yellow').pack(pady=10)
        
        self.output_text = tk.Text(output_frame, height=8, font=('Arial', 16, 'bold'), 
                                  bg='yellow', fg='red', bd=5, relief='solid')
        self.output_text.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        self.output_text.insert('1.0', '⭐ TRANSLATION WILL APPEAR HERE ⭐\n\nEnter text above and click TRANSLATE!')
        
        # Status
        self.status = tk.Label(self.root, text="READY TO TRANSLATE", 
                              font=('Arial', 14, 'bold'), bg='black', fg='lime')
        self.status.pack(fill=tk.X, pady=5)
        
    def translate(self):
        text = self.input_text.get("1.0", tk.END).strip()
        if not text:
            self.output_text.delete("1.0", tk.END)
            self.output_text.insert("1.0", "❌ PLEASE ENTER TEXT TO TRANSLATE ❌")
            return
            
        self.status.config(text="🔄 TRANSLATING... PLEASE WAIT 🔄", bg='orange')
        self.translate_btn.config(text="⏳ WORKING...", bg='gray')
        self.root.update()
        
        # Language mapping
        lang_map = {"English": "en_XX", "Nepali": "ne_NP", "Sinhala": "si_LK"}
        src = lang_map[self.from_lang.get()]
        
        try:
            response = requests.post("http://localhost:8000/translate", 
                                   json={"text": text, "src_lang": src, "tgt_lang": "en_XX"},
                                   timeout=10)
            
            if response.status_code == 200:
                result = response.json()["translated_text"]
                self.output_text.delete("1.0", tk.END)
                self.output_text.insert("1.0", f"✅ SUCCESS! ✅\n\nTRANSLATION:\n{result}")
                self.output_text.config(bg='lightgreen')
                self.status.config(text="✅ TRANSLATION COMPLETE! ✅", bg='green')
                
                # Flash effect
                self.root.after(1000, lambda: self.output_text.config(bg='yellow'))
            else:
                self.output_text.delete("1.0", tk.END)
                self.output_text.insert("1.0", f"❌ ERROR {response.status_code} ❌\n\nPlease try again!")
                self.status.config(text="❌ TRANSLATION FAILED ❌", bg='red')
                
        except Exception as e:
            self.output_text.delete("1.0", tk.END)
            self.output_text.insert("1.0", f"❌ CONNECTION ERROR ❌\n\n{str(e)}")
            self.status.config(text="❌ CANNOT CONNECT TO SERVER ❌", bg='red')
        
        self.translate_btn.config(text="🔄 TRANSLATE NOW 🔄", bg='orange')
    
    def run(self):
        self.root.mainloop()

if __name__ == "__main__":
    app = AlwaysVisibleTranslator()
    app.run()