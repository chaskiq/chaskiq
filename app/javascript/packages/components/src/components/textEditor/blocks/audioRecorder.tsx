import React, { useState } from 'react';
import { EditorBlock } from 'draft-js';
import { CheckIcon, DeleteIcon, MicIcon } from '../../icons';
import { updateDataOfBlock } from 'Dante2/package/esm/editor/model';

const AudioRecorderBlock = (props) => {
  const { blockProps, block } = props;

  const [stored, setStored] = useState(block.data.get('stored'));
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(block.data.get('url'));
  const [loading_progress, setLoadingProgress] = useState(0);
  // const [url, setUrl] = useState(block.data.get('url'))

  const stream = React.useRef(null);
  const mediaRecorder = React.useRef(null);
  const audioElement = React.useRef(null);

  const config = blockProps.config;
  let file = blockProps.data.get('file');

  const [count, setCount] = useState(0);

  const countTotal = 120;

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (count !== 0) setCount(count - 1);
      if (count === 0) stopRecording();
    }, 1000);

    return () => interval && clearInterval(interval);
  }, [count]);

  const startRecording = async () => {
    setStored(false);
    setAudioUrl(false);

    try {
      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      mediaRecorder.current = new MediaRecorder(stream.current);
      const chunks = [];

      mediaRecorder.current.start();

      mediaRecorder.current.addEventListener('dataavailable', (event) => {
        chunks.push(event.data);
      });

      mediaRecorder.current.addEventListener('stop', () => {
        const audioBlob = new Blob(chunks, { type: 'audio/mp4' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
      });

      setRecording(true);
      setCount(countTotal);
    } catch (error) {
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorder?.current) return;
    if (mediaRecorder?.current.state === 'inactive') return;
    mediaRecorder.current.stop();
    stream?.current?.getTracks()?.forEach((track) => track.stop()); // stop each of them
    stream.current = null;
    setRecording(false);
    setCount(0);
  };

  function uploadRecording(e) {
    uploadFile(audioUrl);
  }

  function cancelRecording() {
    setAudioUrl(null);
    setRecording(null);
    setCount(0);
  }

  /** upload functions */

  // will update block state
  const updateData = (options?: any) => {
    const { getEditorState } = blockProps;
    const { setEditorState } = blockProps;
    const data = block.getData();

    const state = {
      url: audioUrl,
      stored: true,
    };
    const newData = data.merge(state).merge(options);

    return setEditorState(updateDataOfBlock(getEditorState(), block, newData));
  };

  function stopLoader() {
    /*return this.setState({
      loading: false,
      fileReady: false,
    });*/
  }

  const uploadFile = async (blob) => {
    file = await fetch(blob).then((r) => r.blob());

    const construct = {
      uploadCompleted: uploadCompleted,
      file: file,
      props: props,
      stored: true,
    };

    setStored(true);

    // custom upload handler
    if (config.upload_handler) {
      return config.upload_handler(null, construct);
    }

    if (!config.upload_url) {
      stopLoader();
      return;
    }
  };

  function uploadFailed() {
    props.blockProps.removeLock();
    stopLoader();
  }

  function uploadCompleted(url, cb) {
    setAudioUrl(url);
    updateData({ url: url });
    blockProps.removeLock();
    stopLoader();
    file = null;
    setUrlToAudio(url);
    cb && cb();
  }

  function updateProgressBar(e) {
    let complete = loading_progress as any;
    if (e.lengthComputable) {
      complete = (e.loaded / e.total) * 100;
      complete = complete != null ? complete : { complete: 0 };
      setLoadingProgress(complete);
      return console.log(`complete: ${complete}`);
    }
  }

  function setUrlToAudio(url) {
    //this.playMode();
    audioElement.current.src = url;
  }

  return (
    <div>
      <div
        className="flex space-x-2 bg-white justify-center items-center"
        contentEditable={false}
      >
        {!audioUrl && (
          <span className="flex justify-center items-center space-x-2">
            <button
              onClick={!recording ? startRecording : stopRecording}
              //disabled={recording}
              className={`flex justify-center items-center p-2 rounded-sm ${
                recording
                  ? 'bg-red-300 text-red-500'
                  : 'bg-gray-300 text-gray-800'
              } `}
            >
              <MicIcon />
              {!recording && <span> Start Recording </span>}
              {recording && <span> Stop Recording </span>}
            </button>
            {count != 0 && (
              <span>Recording will finish in {count} seconds</span>
            )}
          </span>
        )}

        {audioUrl && stored && (
          <span className="p-2 text-sm flex justify-center items-center space-x-2 text-green-500">
            <CheckIcon />
            <span>Audio Ready</span>
          </span>
        )}

        {audioUrl && !stored && (
          <button
            className="flex justify-center items-center space-x-2 p-2 rounded-sm bg-green-300 text-green-800"
            onClick={uploadRecording}
          >
            <CheckIcon />
            <span>Confirm</span>
          </button>
        )}

        {audioUrl && !stored && (
          <button
            className="flex justify-center items-center p-2 rounded-sm text-red-600"
            onClick={cancelRecording}
          >
            <DeleteIcon />
            <span>Cancel</span>
          </button>
        )}

        {audioUrl && <audio src={audioUrl} controls ref={audioElement} />}
      </div>

      <EditorBlock
        {...Object.assign({}, props, {
          editable: true,
          className: 'imageCaption',
        })}
      />
    </div>
  );
};

export default AudioRecorderBlock;

export const AudioRecorderBlockConfig = (options = {}) => {
  const config = {
    title: 'record a audio',
    type: 'recorded-audio',
    icon: MicIcon,
    block: AudioRecorderBlock,
    editable: true,
    renderable: true,
    breakOnContinuous: true,
    wrapper_class: 'graf graf--audio',
    selected_class: 'is-selected',
    selectedFn: (_block) => {},
    /* handleEnterWithoutText(ctx, block) {
      const { editorState } = ctx.state
      return ctx.onChange(addNewBlockAt(editorState, block.getKey()))
    },
    handleEnterWithText(ctx, block) {
      const { editorState } = ctx.state
      return ctx.onChange(RichUtils.insertSoftNewline(editorState))
      //return ctx.onChange(addNewBlockAt(editorState, block.getKey()))
    }, */
    widget_options: {
      displayOnInlineTooltip: true,
      insertion: 'insertion',
      insert_block: 'image',
    },
    options: {
      seconds_to_record: 120,
    },
  };

  return Object.assign(config, options);
};
