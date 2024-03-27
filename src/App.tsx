import React, {useState, useEffect, ChangeEvent, FormEvent} from 'react';
import './App.less';
import uuid from 'uuid-random';

interface Note {
    id: string;
    title: string;
    text: string;
    createDate: string;
    editData?: string;
}

function App(): JSX.Element {
    const [isAddNote, setIsAddNote] = useState<boolean>(false);
    const [isEditNote, setIsEditNote] = useState<boolean>(false);
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState<Note>({id: '', title: '', text: '', createDate: ''});
    const [editedNote, setEditedNote] = useState<Note>({id: '', title: '', text: '', createDate: ''});


    useEffect(() => {
        const savedNotes: Note[] = JSON.parse(localStorage.getItem('notes') || '[]');
        setNotes(savedNotes);
    }, []);

    const openFromAddNote = () => {
        setIsAddNote(!isAddNote)
        setIsEditNote(false);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const {name, value} = e.target;
        setNewNote((prevNote) => ({
            ...prevNote,
            [name]: value,
        }));
    };

    const handleEditInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const {name, value} = e.target;
        setEditedNote((prevNote) => ({
            ...prevNote,
            [name]: value,
        }));
    };

    const handleAddNote = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (newNote.title.trim() !== '' && newNote.text.trim() !== '') {
            const currentDate = new Date().toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            const updatedNotes: Note[] = [{...newNote, id: uuid(), createDate: currentDate}, ...notes];
            setNotes(updatedNotes);
            localStorage.setItem('notes', JSON.stringify(updatedNotes));
            setNewNote({id: '', title: '', text: '', createDate: ''});
        }
        setIsAddNote(false)
    };

    const handleEditNote = (id: string): void => {
        setIsAddNote(false);
        const noteToEdit: Note | undefined = notes.find((note) => note.id === id);
        if (noteToEdit) {
            setIsEditNote(true);
            setEditedNote({
                id: noteToEdit.id,
                title: noteToEdit.title,
                text: noteToEdit.text,
                createDate: noteToEdit.createDate,
            });
        }
    };

    const handleUpdateNote = (): void => {
        const editData = new Date().toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        const updatedNotes: Note[] = notes.map((note) =>
            note.id === editedNote.id ? {...editedNote, editData} : note
        );
        setNotes(updatedNotes);
        localStorage.setItem('notes', JSON.stringify(updatedNotes));
        setIsEditNote(false);
        setEditedNote({id: '', title: '', text: '', createDate: ''});
    };

    const handleDeleteNote = (id: string): void => {
        const updatedNotes: Note[] = notes.filter((note) => note.id !== id);
        setNotes(updatedNotes);
        localStorage.setItem('notes', JSON.stringify(updatedNotes));
    };

    const sortNotes = (option: string) => {
        let sortedNotes = [...notes];
        switch (option) {
            case 'title':
                sortedNotes.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'createDate':
                sortedNotes.sort((a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime()).reverse();
                break;
            case 'editDate':
                sortedNotes.sort((a, b) => {
                    if (!a.editData && !b.editData) return 0;
                    if (!a.editData) return 1;
                    if (!b.editData) return -1;
                    return new Date(b.editData).getTime() - new Date(a.editData).getTime();
                }).reverse();
                break;
            default:
                break;
        }
        setNotes(sortedNotes);
    };

    const handleSort = (option: string) => {
        sortNotes(option);
    };

    return (
        <div className="app">
            <header className="app_header">
                Сортировать по:
                <div className="sort_buttons">
                    <button onClick={() => handleSort('title')}>заголовку</button>
                    <button onClick={() => handleSort('createDate')}>дате создания</button>
                    <button onClick={() => handleSort('editDate')}>дате редактирования</button>
                </div>
                <button onClick={openFromAddNote}>
                    {isAddNote ? 'Отмена' : 'Добавить заметку'}
                </button>
            </header>

            <main>
                {isAddNote && (
                    <form onSubmit={handleAddNote}>
                        <input
                            name="title"
                            value={newNote.title}
                            onChange={handleInputChange}
                            placeholder="Заголовок"
                        />
                        <input
                            name="text"
                            value={newNote.text}
                            onChange={handleInputChange}
                            placeholder="Текст заметки"
                        />
                        <button type="submit">Добавить</button>
                    </form>
                )}
                {isEditNote && (
                    <form onSubmit={(e) => e.preventDefault()}>
                        <input
                            name="title"
                            value={editedNote.title}
                            onChange={handleEditInputChange}
                            placeholder="Заголовок"
                        />
                        <input
                            name="text"
                            value={editedNote.text}
                            onChange={handleEditInputChange}
                            placeholder="Текст заметки"
                        />
                        <div className="button_group">
                            <button onClick={handleUpdateNote}>Сохранить</button>
                            <button onClick={() => setIsEditNote(false)}>Отменить</button>
                        </div>

                    </form>
                )}
                <div className="note_list">
                    {notes.map((note: Note) => (
                        <div className="note" key={note.id}>
                            <div className="note_content">
                                <h3>{note.title}</h3>
                                <p>{note.text}</p>
                            </div>
                            <div className="note_date">
                                <div className="create_date">
                                    Создан: {note.createDate}
                                </div>
                                <div className="edit_date">
                                    {note.editData ? `Изменен: ${note.editData}` : ''}
                                </div>
                            </div>
                            <div className="note_button_group">
                                <button onClick={() => handleEditNote(note.id)}>Редактировать</button>
                                <button onClick={() => handleDeleteNote(note.id)}>Удалить</button>
                            </div>

                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default App;
