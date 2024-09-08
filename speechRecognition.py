import speech_recognition as sr
import keyboard

# Initialize recognizer class (for recognizing the speech)
r = sr.Recognizer()

# Function to start speech recognition
def recognize_speech():
    with sr.Microphone() as source:
        print("Talk")
        audio_text = r.listen(source)
        print("Time over, thanks")
        try:
            # using google speech recognition
            print("Text: " + r.recognize_google(audio_text))
        except:
            print("Sorry, I did not get that")

# Main loop
print("Press the 'space' key to start talking")

while True:
    # Wait for the 'space' key to be pressed
    if keyboard.is_pressed('space'):
        recognize_speech()
        # Wait until the 'space' key is released to avoid continuous recognition
        while keyboard.is_pressed('space'):
            pass
    
    if keyboard.is_pressed('esc'):
        print("Exiting...")
        break  # Exit the loop