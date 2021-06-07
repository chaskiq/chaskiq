import React from 'react'

let styles = {
  root: { backgroundColor: '#1f4662', color: '#fff', fontSize: '12px' },
  header: {
    backgroundColor: '#193549',
    padding: '5px 10px',
    fontFamily: 'monospace',
    color: '#ffc600',
  },
  pre: {
    display: 'block',
    padding: '10px 30px',
    margin: '0',
    overflow: 'scroll',
  },
}

export default function DebugPrint({ data }) {
  const [show, setShow] = React.useState(false)

  return (
    <div key={1} style={styles.root}>
      <div
        style={styles.header}
        onClick={() => {
          setShow(!show)
        }}
      >
        <strong>Debug</strong>
      </div>
      {show && <pre style={styles.pre}>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  )
}
