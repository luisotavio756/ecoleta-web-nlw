import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import './styles.css';
import { FiUpload } from 'react-icons/fi';

interface Props {
    onFileUploaded: (file: File) => void
}

const Dropzone: React.FC<Props> = ({ onFileUploaded }) => {
    
    const [selectedFiles, setSelectedFiles] = useState('');
    const onDrop = useCallback(acceptedFiles => {
        const file = acceptedFiles[0];

        const fileUrl = URL.createObjectURL(file);

        setSelectedFiles(fileUrl);
        onFileUploaded(file);
        
    }, [onFileUploaded])
    
    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        accept: 'image/*'
    })

    return (
        <div className="dropzone" {...getRootProps()}>
            <input {...getInputProps()} accept="image/*" />
        {/* {
            isDragActive ?
            <p>Drop the files here ...</p> :
            <p>Drag 'n' drop some files here, or click to select files</p>
        } */}
            { selectedFiles 
                ? <img src={selectedFiles} alt="Point File" /> 
                : <p> <FiUpload /> Image do Estabelecimento</p>
            }
            
        </div>
    )
}

export default Dropzone;