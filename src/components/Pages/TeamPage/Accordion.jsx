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
            {Array.isArray(item.content) ? (
              item.content.map((paragraph, i) =>
                typeof paragraph === 'string' ? (
                  <div
                    key={i}
                    dangerouslySetInnerHTML={{ __html: paragraph }}
                  />
                ) : (
                  <div key={i}>{paragraph}</div>
                )
              )
            ) : typeof item.content === 'string' ? (
              <div dangerouslySetInnerHTML={{ __html: item.content }} />
            ) : item.content ? (
              <div>{item.content}</div>
            ) : null}
          </div>
        )}
      </div>
    ))}
  </div>
);
};

export default Accordion;
