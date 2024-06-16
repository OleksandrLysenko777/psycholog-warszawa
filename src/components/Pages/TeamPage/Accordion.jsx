import React, { useState } from 'react';

const Accordion = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleClick = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="accordion">
      {items.map((item, index) => (
        <div key={index} className="tab">
          <button onClick={() => handleClick(index)}>{item.title}</button>
          {activeIndex === index && <div className="content">{item.content}</div>}
        </div>
      ))}
    </div>
  );
};

export default Accordion;
