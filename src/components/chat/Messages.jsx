// <= IMPORTS =>

// MESSAGES TEMPORARY ARRAY
const messages = [1, 2, 3, 4, 5];

const Messages = () => {
  return (
    // MESSAGES MAIN WRAPPER
    <section className="w-full border-2">
      {/* MESSAGES SECTION */}
      <section>
        {messages.map((msg) => (
          <div key={msg}>{msg}</div>
        ))}
      </section>
    </section>
  );
};

export default Messages;
