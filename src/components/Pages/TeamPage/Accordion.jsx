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
          {activeIndex === index && (
            <div className="content">
              {Array.isArray(item.content)
                ? item.content.map((paragraph, i) => (
                    <div key={i} dangerouslySetInnerHTML={{ __html: paragraph }} />
                  ))
                : <p>{item.content}</p>
              }
            </div>
          )}
        </div>
      ))}
    </div>
  );
};



export default Accordion;
