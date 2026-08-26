import React from 'react';

interface MoveHistoryProps {
  moves: string[];
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ moves }) => {
  const pairs: [string, string | undefined][] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push([moves[i], moves[i + 1]]);
  }

  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [moves]);

  return (
    <div
      style={{
        background: '#0f0f1e',
        borderRadius: '10px',
        padding: '16px',
        flex: 1,
        minHeight: '200px',
      }}
    >
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Move History
      </div>
      <div
        ref={listRef}
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#333 transparent',
        }}
      >
        {pairs.length === 0 ? (
          <div style={{ color: '#444', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
            No moves yet
          </div>
        ) : (
          pairs.map(([white, black], i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '30px 1fr 1fr',
                gap: '4px',
                padding: '3px 4px',
                borderRadius: '4px',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.03)',
                fontSize: '14px',
                fontFamily: 'monospace',
              }}
            >
              <span style={{ color: '#555' }}>{i + 1}.</span>
              <span style={{ color: '#eaeaea' }}>{white}</span>
              <span style={{ color: '#aaa' }}>{black ?? ''}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MoveHistory;
