// Temporary redirect to Python backend
import { spawn } from 'child_process';
import path from 'path';

console.log('🔄 Redirecting to Python FastAPI backend...');

// Start the Python backend
const pythonBackend = spawn('python3', ['start_backend.py'], {
  cwd: path.resolve(process.cwd()),
  stdio: 'inherit'
});

pythonBackend.on('error', (err) => {
  console.error('❌ Failed to start Python backend:', err);
  process.exit(1);
});

pythonBackend.on('close', (code) => {
  console.log(`🔄 Python backend exited with code ${code}`);
  process.exit(code || 0);
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down...');
  pythonBackend.kill('SIGINT');
});

process.on('SIGTERM', () => {
  pythonBackend.kill('SIGTERM');
});