import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import './style.css';


interface Props{
    onFileUpload: (file: File) => void;
}

const Dropzone:React.FC<Props> = ({ onFileUpload }) => {
  
    const [selectFileUrl, setSelectFileUrl] = useState('');

    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];
        const fileUrl = URL.createObjectURL(file);
        setSelectFileUrl(fileUrl);
        onFileUpload(file);
    }, [onFileUpload])
    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: 'image/*' 
    })

    return (
        <div className="dropzone" {...getRootProps()}>
            <input {...getInputProps()} accept='image/*' />
            {
                selectFileUrl ? <img src={selectFileUrl} alt="Point Thmbnail" />
                    : (
                        <p>Selecione o image</p>
                    )

            }
        </div>
    )
}
export default Dropzone;