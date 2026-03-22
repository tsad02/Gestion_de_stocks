const dashboardCtrl = require('./src/controllers/dashboard.controller.js');

async function run() {
    const res = {
        json: (data) => console.log('SUCCESS:', data.data ? 'Data loaded successfully' : data),
        status: (code) => ({
            json: (data) => console.error('ERROR RESPONSE:', code, data)
        })
    };
    
    try {
        await dashboardCtrl.getDashboardSummary({}, res, (err) => console.error('NEXT ERROR:', err));
    } catch (err) {
        console.error('CATCH ERROR:', err);
    }
}
run();
