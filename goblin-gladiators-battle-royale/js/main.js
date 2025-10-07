// Oyunu başlat
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();

    // Fare tıklama olayını dinle
    game.canvas.addEventListener('click', (event) => {
        const rect = game.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        game.handleClick(x, y);
    });

    // Mobil dokunma desteği
    game.canvas.addEventListener('touchstart', (event) => {
        event.preventDefault();
        const rect = game.canvas.getBoundingClientRect();
        const touch = event.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        game.handleClick(x, y);
    });
});