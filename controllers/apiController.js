const users = [
    { id: 1, username: 'admin', password: 'password', creditCard: '4532-1111-2222-3333' },
    { id: 2, username: 'alumno', password: 'password1', creditCard: '4532-0000-0000-0000' }
];

exports.vulnerable = (req, res) => {
    // Todos los datos sensibles
    res.json(users);
};

