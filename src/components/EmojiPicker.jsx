import React, { useEffect, useRef, useState } from 'react';
import Picker from 'emoji-picker-react';

function EmojiPicker({ comment, setComment }) {
  const pickerRef = useRef();

  const togglePicker = () => {
    const picker = pickerRef.current
    if(picker.classList.contains('hidden')) {
      picker.classList.remove('hidden')
      picker.classList.add('block')
    } else if (picker.classList.contains('block')) {
      picker.classList.remove('block')
      picker.classList.add('hidden')
    }
  }

  const onEmojiClick = (e, emojiObject) => {
    setComment(`${comment + emojiObject.emoji}`);
  };

  return (
    <div className='relative'>
      <button 
        className="fa-regular fa-face-smile text-2xl mr-4"
        onClick={togglePicker}
      >
      </button>
      <div className="emoji-picker-wrapper 
      absolute bottom-10 text-black overflow-hidden hidden"
      ref={pickerRef}
      >
        <Picker 
          onEmojiClick={onEmojiClick}
          native={true}
          disableSearchBar={true}
          disableSkinTonePicker={true}
          groupVisibility={{
            flags: false,
            recently_used: false,
            symbols: false,
            animals_nature: false,
            food_drink: false,
            travel_places: false,
            activities: false,
            objects: false,
            smileys_people: true
          }}
        />
      </div>
    </div>

  );
}
export default EmojiPicker