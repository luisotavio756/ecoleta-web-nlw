import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';

import logo from '../../assets/logo.svg';
// import { Container } from './styles';
import './styles.css';
import { FiArrowLeft } from 'react-icons/fi';
import Dropzone from '../../components/Dropzone';

import api from '../../services/api';

interface Item{
    id: number,
    title: string,
    image_url: string
}

interface IBGEUFResponse {
    sigla: string
}

interface IBGECityResponse {
    nome: string
}

const CreatePoint = () => {
    const [ items, setItems ] = useState<Item[]>([]);
    const [ ufs, setUFs ] = useState<string[]>([]);
    const [ citys, setCitys ] = useState<string[]>([]);

    const [ formData, setFormData ] = useState({
        name: '',
        email: '',
        whatsapp: ''
    });

    const [ InitPosition, setInitPosition ] = useState<[number, number]>([-4.9332123, -37.9678644]);


    const [ selectedUF, setSelectedUF ] = useState('0');
    const [ selectedCity, setSelectedCity ] = useState('0');
    const [ selectedPosition, setSelectedPosition ] = useState<[number, number]>([-4.9332123, -37.9678644]);
    const [ selectedItems, setSelectedItems ] = useState<number[]>([]);
    const [ selectedFile, setSelectedFile ] = useState<File>();

    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;

            setInitPosition([
                latitude,
                longitude
            ]);
            
        },
        err => {
            alert('Please enable your GPS position feature.');
        },
        {
            maximumAge: 1000, 
            timeout:5000, 
            enableHighAccuracy: true
        }
        )
    }, []);


    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data)
        })
    }, []);
    
    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla);

            setUFs(ufInitials);
        })
    }, []);

    useEffect(() => {
        if(selectedUF === '0')
            return;

        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`).then(response => {
            const cityNames = response.data.map(city => city.nome);

            setCitys(cityNames);
        })
        
    }, [selectedUF]);

    function handleSelectUF(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;

        setSelectedUF(uf);
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;

        setSelectedCity(city);
    }

    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ]);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value
        })
    }

    function handleSelectItem(id: number) {
        const already = selectedItems.findIndex(item => item === id);

        if(already > -1) {
            let array = selectedItems.filter(item => item !== id);

            setSelectedItems(array);

        }else {
            setSelectedItems([
                ...selectedItems,
                id
            ]);
        }
        
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        
        try {
            const { name, email, whatsapp} = formData;
            const uf = selectedUF;
            const city = selectedCity;
            const [latitude, longitude] = selectedPosition;
            const items = selectedItems;

            const data = new FormData();

            data.append('name', name);
            data.append('email', email);
            data.append('whatsapp', whatsapp);
            data.append('uf', uf);
            data.append('city', city);
            data.append('latitude', String(latitude));
            data.append('longitude', String(longitude));
            data.append('items', items.join(','));

            if(selectedFile) {
                data.append('image', selectedFile);
            }
      
            const response = await api.post('/points', data);

            alert('Ponto de Coleta criado !');

            history.push('/');
            
        } catch (error) {
            alert(error);
        }
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecolete"/>

                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Cadastro do<br />ponto de coleta</h1>
                <Dropzone onFileUploaded={setSelectedFile}/>
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label>Nome</label>
                        <input
                            name="name"
                            type="text"
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label>Email</label>
                            <input
                                name="email"
                                type="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label>Whatsapp</label>
                            <input
                                name="whatsapp"
                                type="text"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>
                    <Map center={[-4.9332123, -37.9678644]} zoom={15} onClick={handleMapClick}>
                        <TileLayer 
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition} />
                    </Map>
                    <div className="field-group">
                        <div className="field">
                            <label>UF</label>
                            <select 
                                name="uf"
                                value={selectedUF} 
                                onChange={handleSelectUF}
                            >
                                <option value="0">Selecione um UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label>Cidade</label>
                            <select
                                name="city"
                                value={selectedCity}
                                onChange={handleSelectCity}    
                            >
                                <option value="0">Selecione um cidade</option>
                                {citys.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de Coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        { items.map(item => (
                            <li 
                                key={item.id} 
                                onClick={() => handleSelectItem(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={ item.image_url } alt={item.title}/>
                                <span>{ item.title }</span>
                            </li>
                        ))}
                        
                    </ul>
                </fieldset>
                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    );
}

export default CreatePoint;